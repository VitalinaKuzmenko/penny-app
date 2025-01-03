import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data } = body;

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "No data received." }, { status: 400 });
    }

    const response = await axios.post("http://localhost:4000/csv/upload", {
      data: data,
    });

    // Send a success response
    return NextResponse.json({ message: response.data.message });
  } catch (error) {
    console.error("Error handling upload:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the data." },
      { status: 500 }
    );
  }
}
