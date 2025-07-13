// apps/web-frontend/app/(buyer)/checkout/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { getCart, getShippingRates, getMyProfile, createOrder } from '../../services/api';
import Select from '@/app/component/Select';
import Button from '@/app/component/Button';

// Definisikan tipe data yang kita butuhkan
interface Address {
  _id: string;
  label: string;
  street: string;
  city: string;
  postalCode?: string;
}
interface CartItem {
  productId: { _id: string; name: string; price: number; images?: string[]; weight?: number; };
  quantity: number;
}
interface CartResponse {
  items: CartItem[];
}
interface ShippingRate {
  courier_name: string;
  courier_service_name: string;
  courier_service_code: string;
  description: string;
  estimation: string;
  price: number;
}

export default function CheckoutPage() {
  const { user, token, isAuthLoading, fetchCartCount } = useAuth();
  const router = useRouter();

  const [cart, setCart] = useState<CartResponse | null>(null);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingRate[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<{ service: string; cost: number; courier: string; etd: string; } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingRates, setIsCheckingRates] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ambil data keranjang DAN profil user (untuk alamat) saat komponen dimuat
  useEffect(() => {
    if (!isAuthLoading && token) {
      const fetchData = async () => {
        try {
          // Ambil data keranjang dan profil secara bersamaan
          const [cartData, profileData] = await Promise.all([
            getCart(token),
            getMyProfile(token)
          ]);

          // Jika keranjang kosong, tendang user kembali ke halaman utama
          if (!cartData.items || cartData.items.length === 0) {
            alert("Keranjang Anda kosong. Silakan belanja dulu.");
            router.push('/');
            return;
          }

          setCart(cartData);
          setUserAddresses(profileData.addresses || []);
          // Otomatis pilih alamat pertama jika ada
          if (profileData.addresses && profileData.addresses.length > 0) {
            setSelectedAddressId(profileData.addresses[0]._id);
          }
        } catch (err) { 
          setError("Gagal memuat data checkout. Silakan coba lagi."); 
        } finally { 
          setIsLoading(false); 
        }
      };
      fetchData();
    } else if (!isAuthLoading && !token) {
      // Jika tidak ada token setelah loading auth selesai, redirect ke login
      router.push('/login');
    }
  }, [token, isAuthLoading, router]);

  // Fungsi untuk mengecek ongkir
  const handleCheckRates = async () => {
    if (!selectedAddressId || !selectedCourier || !token) {
      alert("Pilih alamat dan kurir terlebih dahulu.");
      return;
    }
    setIsCheckingRates(true);
    setError(null);
    setShippingOptions([]);
    setSelectedShipping(null);
    try {
      const payload = { destinationAddressId: selectedAddressId, courier: selectedCourier };
      const data = await getShippingRates(payload, token);
      
      if (data && Array.isArray(data.pricing)) {
        setShippingOptions(data.pricing);
      } else {
        setError("Tidak ada layanan pengiriman yang tersedia untuk kurir ini.");
      }
    } catch (err: any) { 
      setError(err.message || "Gagal cek ongkir."); 
    } finally { 
      setIsCheckingRates(false); 
    }
  };

  // Fungsi untuk membuat pesanan dan membayar
  const handlePlaceOrder = async () => {
    if (!selectedAddressId || !selectedShipping || !cart || !token) {
      alert("Silakan lengkapi alamat dan pilihan pengiriman terlebih dahulu.");
      return;
    }
    setIsPlacingOrder(true);
    setError(null);
    try {
      const selectedAddress = userAddresses.find(addr => addr._id === selectedAddressId);
      const orderPayload = {
        items: cart.items.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity,
        })),
        shippingInfo: {
          address: `${selectedAddress?.street}, ${selectedAddress?.city}`,
          city: selectedAddress?.city,
          postalCode: selectedAddress?.postalCode,
          courier: selectedShipping.courier,
          service: selectedShipping.service,
          cost: selectedShipping.cost,
          etd: selectedShipping.etd,
        }
      };
      
      const orderResponse = await createOrder(orderPayload, token);
      
      if (orderResponse.paymentToken) {
        (window as any).snap.pay(orderResponse.paymentToken, {
          onSuccess: function(result: any){
            alert("Pembayaran berhasil!");
            router.push('/products');
          },
          onPending: function(result: any){
            alert("Pembayaran Anda sedang diproses.");
            router.push('/products');
          },
          onError: function(result: any){
            alert("Pembayaran gagal!");
            setError("Gagal memproses pembayaran.");
          },
          onClose: function(){
            router.push('/products'); // Kembali ke marketplace jika pop-up ditutup
          }
        });
      }
      fetchCartCount(); // Update jumlah item di keranjang di Navbar
    } catch (err: any) {
      setError(err.message || "Gagal membuat pesanan.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const subtotal = cart?.items.reduce((acc, item) => acc + item.productId.price * item.quantity, 0) || 0;
  const appFee = 2000;
  const totalAmount = subtotal + (selectedShipping?.cost || 0) + appFee;

  // Script untuk memuat Snap.js dari Midtrans
  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!clientKey) {
      console.error("Midtrans Client Key tidak ditemukan di .env.local");
      return;
    }
    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    }
  }, []);

  if (isLoading || isAuthLoading) {
    return <div className="p-8 text-center">Memuat halaman checkout...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container p-4 mx-auto md:p-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">Checkout</h1>
        {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 text-white bg-green-600 rounded-full">1</div>
                <h2 className="text-xl font-semibold text-gray-800">Alamat Pengiriman</h2>
              </div>
              <Select label="" value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)}>
                {userAddresses.length > 0 ? (
                  userAddresses.map(addr => (
                    <option key={addr._id} value={addr._id}>{addr.label} - {addr.street}, {addr.city}</option>
                  ))
                ) : (
                  <option value="">Anda belum punya alamat tersimpan.</option>
                )}
              </Select>
              <Link href="/profile/addresses" className="inline-block mt-2 text-sm text-green-600 hover:underline">
                + Tambah atau kelola alamat
              </Link>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 text-white bg-green-600 rounded-full">2</div>
                <h2 className="text-xl font-semibold text-gray-800">Pilih Pengiriman</h2>
              </div>
              <div className="flex items-end gap-4 mt-4">
                <Select label="Pilih Kurir" value={selectedCourier} onChange={(e) => setSelectedCourier(e.target.value)} wrapperClassName="flex-grow">
                  <option value="">-- Kurir --</option>
                  <option value="jne">JNE</option>
                  <option value="sicepat">SiCepat</option>
                  <option value="lalamove">Lalamove</option>
                </Select>
                <Button onClick={handleCheckRates} isLoading={isCheckingRates} variant="secondary">Cek Ongkir</Button>
              </div>
              <div className="mt-4 space-y-3">
                {shippingOptions.map((rate) => (
                  <div 
                    key={rate.courier_service_code} 
                    onClick={() => setSelectedShipping({ courier: rate.courier_name, service: rate.courier_service_name, cost: rate.price, etd: rate.estimation })}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition ${selectedShipping?.service === rate.courier_service_name ? 'border-2 border-green-600 bg-green-50' : 'border-gray-200'}`}
                  >
                    <div>
                      <p className="font-bold">{rate.courier_name.toUpperCase()} - {rate.courier_service_name}</p>
                      <p className="text-sm text-gray-500">{rate.description} (Estimasi {rate.estimation})</p>
                    </div>
                    <p className="font-semibold">Rp {rate.price.toLocaleString('id-ID')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="p-6 space-y-4 bg-white border rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800">Ringkasan Belanja</h2>
                <div className="space-y-4">
                  {cart?.items.map(({ productId, quantity }) => (
                    <div key={productId._id} className="flex items-center gap-4">
                      <Image
                        src={productId.images?.[0] || '/images/placeholder.png'}
                        alt={productId.name}
                        width={64}
                        height={64}
                        className="object-cover border rounded-md"
                      />
                      <div className="flex-grow">
                        <p className="font-semibold leading-tight">{productId.name}</p>
                        <p className="text-sm text-gray-500">x {quantity}</p>
                      </div>
                      <p className="text-sm font-medium">Rp {(productId.price * quantity).toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>
                <hr/>
                <div className="space-y-2">
                  <div className="flex justify-between"><p className="text-gray-600">Subtotal</p><p className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</p></div>
                  <div className="flex justify-between"><p className="text-gray-600">Ongkos Kirim</p><p className="font-medium">Rp {(selectedShipping?.cost || 0).toLocaleString('id-ID')}</p></div>
                  <div className="flex justify-between"><p className="text-gray-600">Biaya Aplikasi</p><p className="font-medium">Rp {appFee.toLocaleString('id-ID')}</p></div>
                </div>
                <hr/>
                <div className="flex items-baseline justify-between text-lg font-bold"><p>Total Pembayaran</p><p>Rp {totalAmount.toLocaleString('id-ID')}</p></div>
                <Button onClick={handlePlaceOrder} isLoading={isPlacingOrder} className="w-full mt-4">
                  Bayar Sekarang
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
