import React, { useState } from "react";
import Products from "./Products";

interface IProduct {
  id: string;
  product: string;
}

interface IReminder {
  id: string;
  category: string;
  products: IProduct[];
}

interface ReminderProps {
  category: IReminder;
  saveCategoryEdited: (a: string, c: string) => void;
  saveProductEdited: (a: string, b: string, c: string) => void;
}

export default function Reminders({
  category,
  saveCategoryEdited,
  saveProductEdited,
}: ReminderProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  return (
    <div>
      <div
        className="p-2 ml-2 w-max"
        onClick={() => {
          setIsEditing(true);
          setValue(category.category);
        }}
        onBlur={() => {
          setIsEditing(false);
          saveCategoryEdited(category.id, value);
        }}>
        {!isEditing ? (
          <h3>{category.category}</h3>
        ) : (
          <input
            id={category.id}
            className="border-2 p-2 bg-transparent text-white"
            value={value}
            name={category.id}
            type="text"
            onChange={(e) => {
              setValue(e.target.value);
            }}
          />
        )}
      </div>
      {category.products.map((product) => {
        return (
          <Products
            key={product.id}
            product={product}
            saveProductEdited={saveProductEdited}
            categoryId={category.id}
          />
        );
      })}
    </div>
  );
}
