import React, { useState } from "react";

interface IProduct {
  id: string;
  product: string;
}
interface ProductsProps {
  product: IProduct;
  saveEdit: (a: string, b: string, c: string) => void;
  categoryId: string;
  productEdited: string;
  setProductEdited: (a: string) => void;
}

export default function Products({
  product,
  saveEdit,
  categoryId,
  productEdited,
  setProductEdited,
}: ProductsProps) {
  const [checkedInput, setCheckedInput] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

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
        className="p-2"
        onClick={() => {
          setIsEditing(true);
          setProductEdited(product.product);
        }}
        onBlur={() => {
          setIsEditing(false);
          saveEdit(categoryId, productEdited, product.id);
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
            className="border-none p-2 bg-transparent text-white"
            value={productEdited}
            name={product.id}
            type="text"
            onChange={(e) => {
              setProductEdited(e.target.value);
            }}
            // onKeyDown={() => saveEdit(item.id)}
          />
        )}
      </div>
    </div>
  );
}
