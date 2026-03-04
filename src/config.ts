// Konfigurasi Environment Variables
// Di Netlify, pastikan Anda menambahkan environment variable dengan prefix VITE_ 
// (misalnya: VITE_API_KEY) agar dapat diakses oleh aplikasi React/Vite di sisi klien.

export const config = {
  // Mengambil API Key dari environment variable Netlify (via Vite)
  apiKey: import.meta.env.VITE_API_KEY || '',
  
  // Contoh penggunaan variabel lain jika diperlukan
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.vitaguard.example.com',
};
