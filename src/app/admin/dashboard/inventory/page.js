"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("products")
      .insert([{ name, price: parseFloat(price), in_stock: true }]);

    if (!error) alert("Product added successfully!");
  };

  return <form onSubmit={handleAdd}>{/* Form inputs go here */}</form>;
}
