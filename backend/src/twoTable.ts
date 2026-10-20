import connection from "./db/index.ts";
import express, { type Express, type Request, type Response } from 'express';
import cors from "cors";

const app = express()
const port = 2662

app.use(cors());
app.use(express.json());

app.get('/api/puppy', async (req: Request, res: Response) => {
    try {
        const [puppy] = await connection.query(`
            SELECT
                puppy.id_puppy,
                puppy.nama_puppy,
                puppy.jenis,
                puppy.umur,
                puppy.gender,
                shelter.nama_shelter
            FROM puppy
            JOIN shelter
                ON puppy.id_shelter = shelter.id_shelter
        `); 

        res.status(200).json({
            message: 'Data puppy berhasil di-fetch.',
            data: puppy
        });

    } catch (error) {
        res.status(500).json({
            message: 'Gagal mengambil data puppy.',
            error: error
        });
    }
});

app.get('/api/shelter', async (req: Request, res: Response) => {
  try {
    const [shelter] = await connection.query(
      'SELECT * FROM shelter'
    );

    res.status(200).json({
      message: 'Data shelter berhasil di-fetch.',
      data: shelter
    });

  } catch (error) {
    console.error('Error mengambil data shelter:', error);

    res.status(500).json({
      message: 'Gagal mengambil data shelter.',
      error: error 
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})