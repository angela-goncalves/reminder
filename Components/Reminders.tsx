import React, { useState } from "react";
import Products from "./Product";
import { Input } from "./UI/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/Components/UI/accordion";
interface IProduct {
  id: string;
  name: string;
  isChecked: boolean;
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
interface ISetProductToComplete {
  productId: string;
  categoryId: string;
}
interface ReminderProps {
  category: IReminder;
  saveCategoryEdited: (saveCategoryEditedObj: ISaveCategoryEdited) => void;
  setProductToComplete: (productCompleted: ISetProductToComplete) => void;
  saveProductEdited: (saveProductEditedObj: ISaveProductEdited) => void;
  showNoChecked: boolean;
}
function dec2hex(dec: number) {
  return dec.toString(16).padStart(2, "0");
}
function generateId(len: number) {
  var arr = new Uint8Array((len || 20) / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join("");
}

export default function Reminders({
  category,
  saveCategoryEdited,
  saveProductEdited,
  setProductToComplete,
  showNoChecked,
}: ReminderProps) {
  const [newCategory, setNewCategory] = useState<string>(category.categoryName);

  const productEmptyObj = {
    name: "",
    id: generateId(15),
    isChecked: false,
  };

  const isProductEmpy = category.products.find((item) => item.name === "");

  return (
    <div>
      <Accordion
        type="single"
        defaultValue={category.categoryName}
        collapsible
        className="w-full">
        <AccordionItem
          value={category.categoryName}
          className="border-neutral-600">
          <div className="pl-0 pt-2 flex w-full justify-between">
            <label htmlFor={category.categoryName} className="w-full">
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
            <AccordionTrigger></AccordionTrigger>
          </div>
          <AccordionContent>
            {showNoChecked
              ? category.products.map((product, i) => {
                  return (
                    <div key={`${product.id}${i}`}>
                      <Products
                        product={product}
                        saveProductEdited={saveProductEdited}
                        categoryId={category.id}
                        // products={category.products}
                        setProductToComplete={setProductToComplete}
                      />
                    </div>
                  );
                })
              : category.products
                  .filter((ele) => !ele.isChecked)
                  .map((product) => {
                    return (
                      <Products
                        key={`${product.id}`}
                        product={product}
                        saveProductEdited={saveProductEdited}
                        categoryId={category.id}
                        setProductToComplete={setProductToComplete}
                      />
                    );
                  })}

            {!isProductEmpy && (
              <Products
                key={productEmptyObj.id}
                product={productEmptyObj}
                saveProductEdited={saveProductEdited}
                categoryId={category.id}
                setProductToComplete={setProductToComplete}
              />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
