// apps/backend/src/app/shipping/shipping.controller.ts
import { Request, Response } from 'express';
import { biteship } from '../../config/biteship';
import { checkRatesSchema } from './shipping.dto';
import { CartModel } from '../cart/cart.model';
import { UserModel } from '../users/user.model';
import { IProduct } from '../products/product.model';

/**
 * Helper function untuk mencari areaId dari Biteship berdasarkan nama kota/kecamatan.
 */
const findAreaId = async (searchQuery: string): Promise<string | null> => {
  try {
    const response = await biteship.get(`/maps/areas?countries=ID&input=${encodeURIComponent(searchQuery)}&type=single`);
    if (response.data.success && response.data.areas.length > 0) {
      return response.data.areas[0].id;
    }
    return null;
  } catch (error) {
    console.error(`Gagal mencari areaId untuk: ${searchQuery}`, error);
    return null;
  }
};

/**
 * Controller untuk menghitung ongkos kirim secara dinamis menggunakan Biteship.
 */
export const getShippingRates = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const { destinationAddressId, courier } = checkRatesSchema.parse(req.body);

    // === BAGIAN YANG DIPERBAIKI ===
    // Kita perbaiki tipe data generic di dalam populate
    const cart = await CartModel.findOne({ userId: req.user.id })
      .populate<{ 
        items: { 
          productId: Pick<IProduct, 'name' | 'price' | 'weight'> & { farmerId: string };
          quantity: number; // <-- Kita tambahkan 'quantity' di sini
        }[] 
      }>('items.productId', 'name price weight farmerId');
    // ============================
      
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Keranjang belanja Anda kosong.' });
    }

    const farmerId = cart.items[0].productId.farmerId;
    const farmer = await UserModel.findById(farmerId);
    const originSearchQuery = `${farmer?.addresses[0]?.district}, ${farmer?.addresses[0]?.city}`;

    const buyer = req.user;
    const destinationAddress = buyer.addresses.find(addr => addr._id.toString() === destinationAddressId);
    const destinationSearchQuery = `${destinationAddress?.district}, ${destinationAddress?.city}`;

    if (!originSearchQuery || !destinationSearchQuery) {
      return res.status(400).json({ message: 'Alamat asal atau tujuan tidak lengkap.' });
    }

    const [originAreaId, destinationAreaId] = await Promise.all([
      findAreaId(originSearchQuery),
      findAreaId(destinationSearchQuery)
    ]);

    if (!originAreaId || !destinationAreaId) {
      return res.status(400).json({ message: 'Tidak dapat menemukan ID area untuk alamat yang diberikan.' });
    }

    // Sekarang kode di bawah ini tidak akan error lagi karena TypeScript sudah tahu
    // bahwa setiap 'item' memiliki 'quantity'.
    const biteshipPayload = {
      origin_area_id: originAreaId,
      destination_area_id: destinationAreaId,
      couriers: courier,
      items: cart.items.map(item => ({
        name: item.productId.name,
        description: "Produk Pertanian",
        value: item.productId.price,
        weight: item.productId.weight || 500,
        quantity: item.quantity, // <-- Baris ini sekarang aman
      }))
    };

    const response = await biteship.post('/rates/couriers', biteshipPayload);

    return res.status(200).json(response.data);

  } catch (error: any) {
    if (error.isZodError) {
      return res.status(400).json({ message: 'Data input tidak valid', errors: error.errors });
    }
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    console.error("Get Shipping Rates Error:", error);
    return res.status(500).json({ message: 'Gagal menghitung ongkos kirim' });
  }
};
