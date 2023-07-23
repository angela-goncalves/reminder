import React, { useRef, useState } from "react";
import Products from "./Product";
import { Input } from "./UI/input";

interface IProduct {
  id: string;
  name: string;
}
interface IReminder {
  id: string;
  categoryName: string;
  products: IProduct[];
}
interface ISaveProductEdited {
  categoryId: string;
  productEdited: string;
  productId: string;
}
interface ISaveCategoryEdited {
  categoryId: string;
  categoryEdited: string;
}
interface ReminderProps {
  category: IReminder;
  saveCategoryEdited: (saveCategoryEditedObj: ISaveCategoryEdited) => void;
  moveProductToChecked: (productId: string, categoryId: string) => void;
  saveProductEdited: (saveProductEditedObj: ISaveProductEdited) => void;
}

export default function Reminders({
  category,
  saveCategoryEdited,
  saveProductEdited,
  moveProductToChecked,
}: ReminderProps) {
  const [newCategory, setNewCategory] = useState<string>(category.categoryName);

  return (
    <div>
      <div className="pl-0 pt-2 w-max ">
        <label htmlFor={category.categoryName}>
          <Input
            id={category.categoryName}
            className="p-2 bg-transparent border-none text-xl font-bold text-white focus:outline-none"
            value={newCategory}
            name={category.categoryName}
            type="text"
            onChange={(e) => {
              setNewCategory(e.target.value);
            }}
            onBlur={() => {
              const categroyToSave = {
                categoryId: category.id,
                categoryEdited: newCategory,
              };
              saveCategoryEdited(categroyToSave);
            }}
          />
        </label>
      </div>
      {category.products.map((product) => {
        return (
          <Products
            key={product.id}
            product={product}
            saveProductEdited={saveProductEdited}
            categoryId={category.id}
            moveProductToChecked={moveProductToChecked}
          />
        );
      })}
    </div>
  );
}
