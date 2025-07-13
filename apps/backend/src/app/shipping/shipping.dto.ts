import { z } from 'zod';

export const checkRatesSchema = z.object({
  destinationAddressId: z.string().nonempty("ID Alamat tujuan wajib diisi"),
  courier: z.string().nonempty("Kurir wajib dipilih"),
});