import connection from "./db/index.ts";
import express, { type Express, type Request, type Response } from 'express';
import cors from "cors";
import { z } from "zod";

import authRoutes from "./routes/auth.js";

const app = express()
const port = 2662

app.use(cors());
app.use(express.json());

// Setelah app.use(express.json())
app.use("/api/auth", authRoutes);

// Buat 2 endpoint untuk meng-insert ke masing-masing table.
// Buat juga validasi data yang masuk.

// INI VALIDASI READ MENGGUNAKAN ZOD
const puppySchema = z.object({
  nama_puppy: z
    .string()
    .min(1, "Nama puppy wajib diisi."),

  jenis: z
    .string()
    .min(1, "Jenis puppy wajib diisi."),

  umur: z
    .number()
    .int("Umur harus berupa angka bulat."),

  gender: z
    .enum(["M", "F"], {
      message: "Gender harus M atau F.",
    }),

  id_shelter: z
    .number()
    .int()
    .positive("ID shelter harus lebih dari 0."),
});


const shelterSchema = z.object({
  nama_shelter: z
    .string()
    .min(1, "Nama shelter wajib diisi."),

  alamat: z
    .string()
    .min(1, "Alamat shelter wajib diisi."),

  no_telepon: z
    .string()
    .min(10, "Nomor telepon minimal 10 karakter."),
});

// This for CREATE
app.post("/api/puppy", async (req: Request, res: Response) => {
    try {
      const result = puppySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Data puppy tidak valid.",
          errors: result.error.issues,
        });
      }

      const {
        nama_puppy,
        jenis,
        umur,
        gender,
        id_shelter,
      } = result.data;

      const [puppy] = await connection.query(
        `INSERT INTO puppy (nama_puppy, jenis, umur, gender, id_shelter)
        VALUES
          (?, ?, ?, ?, ?)
        `,
        [
          nama_puppy,
          jenis,
          umur,
          gender,
          id_shelter,
        ]  
      );

      res.status(201).json({
        message: "Data puppy berhasil ditambahkan.",
        data: puppy,
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Gagal menambahkan data puppy.",
        error: error,
      });
    }
  }
);

app.post("/api/shelter", async (req: Request, res: Response) => {
    try {
      const result = shelterSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Data shelter tidak valid.",
          errors: result.error.issues,
        });
      }

      const {
        nama_shelter,
        alamat,
        no_telepon,
      } = result.data;

      const [shelter] = await connection.query(
        `INSERT INTO shelter (nama_shelter, alamat, no_telepon)
        VALUES
          (?, ?, ?)
        `,
        [
          nama_shelter,
          alamat,
          no_telepon,
        ]
      );

      res.status(201).json({
        message: "Data shelter berhasil ditambahkan.",
        data: shelter,
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Gagal menambahkan data shelter.",
        error: error,
      });
    }
  }
);

// This for READ
app.get('/api/puppy', async (req: Request, res: Response) => {
    try {
        const [puppy] = await connection.query(`
            SELECT
                puppy.id_puppy,
                puppy.nama_puppy,
                puppy.jenis,
                puppy.umur,
                puppy.gender,
                puppy.id_shelter,
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

// This For UPDATE
app.put("/api/puppy/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID puppy tidak valid.",
      });
    }

    const result = puppySchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Data puppy tidak valid.",
        errors: result.error.issues,
      });
    }

    const {
      nama_puppy,
      jenis,
      umur,
      gender,
      id_shelter,
    } = result.data;

    const [puppy] = await connection.query(
      `
      UPDATE puppy
      SET
        nama_puppy = ?,
        jenis = ?,
        umur = ?,
        gender = ?,
        id_shelter = ?
      WHERE id_puppy = ?
      `,
      [
        nama_puppy,
        jenis,
        umur,
        gender,
        id_shelter,
        id,
      ]
    );

    res.status(200).json({
      message: "Data puppy berhasil diubah.",
      data: puppy,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengubah data puppy.",
      error: error,
    });
  }
});

app.put("/api/shelter/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID shelter tidak valid.",
      });
    }

    const result = shelterSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Data shelter tidak valid.",
        errors: result.error.issues,
      });
    }

    const {
      nama_shelter, 
      alamat,
      no_telepon,
    } = result.data;

    const [shelter] = await connection.query (
      `
      UPDATE shelter
      SET
        nama_shelter = ?,
        alamat = ?,
        no_telepon = ?
      WHERE id_shelter = ?
      `,
      [
        nama_shelter,
        alamat,
        no_telepon,
        id,
      ]
    );

    res.status(200).json({
      message: "Data shelter berhasil diubah.",
      data: shelter,
    })

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengubah data shelter.",
      error: error,
    });
  }
});

// This For DELETE
app.delete("/api/puppy/:puppyId", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.puppyId);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID puppy tidak valid.",
      });
    }

    const [result] = await connection.query(
      `
      DELETE FROM puppy
      WHERE id_puppy = ?
      `,
      [id]
    );

    res.status(200).json({
      message: "Data puppy berhasil dihapus.",
      data: result,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal menghapus data puppy.",
      error: error,
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})