import React, { useState } from "react";

interface IProduct {
  id: string;
  product: string;
}
interface ProductsProps {
  product: IProduct;
  saveProductEdited: (a: string, b: string, c: string) => void;
  categoryId: string;
}

export default function Products({
  product,
  saveProductEdited,
  categoryId,
}: ProductsProps) {
  const [checkedInput, setCheckedInput] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  return (
    <div className="flex">
      <label className="flex">
        <input
          id={`${product.id}`}
          name={`${product.id}`}
          type="checkbox"
          value={product.product}
          checked={checkedInput}
          onChange={() => {
            setCheckedInput(!checkedInput);
          }}
        />
      </label>
      <div
        className="p-2 ml-2"
        onClick={() => {
          setIsEditing(true);
          setValue(product.product);
        }}
        onBlur={() => {
          setIsEditing(false);
          saveProductEdited(categoryId, value, product.id);
        }}>
        {!isEditing ? (
          <p
            style={{
              textDecoration: checkedInput ? "line-through" : "none",
            }}>
            {product.product}
          </p>
        ) : (
          <input
            id={product.id}
            className="border-none p-0 bg-transparent text-white"
            value={value}
            name={product.id}
            type="text"
            onChange={(e) => {
              setValue(e.target.value);
            }}
            // onKeyDown={() => saveEdit(item.id)}
          />
        )}
      </div>
    </div>
  );
}
