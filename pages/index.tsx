import { useCompletion } from "ai/react";
import { Inter } from "next/font/google";
import { useState } from "react";
import Reminders from "@/Components/Reminders";

const inter = Inter({ subsets: ["latin"] });

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

export default function Home() {
  const [listReminders, setListReminders] = useState<IReminder[]>([]);
  const [checkedProducts, setCheckedProducts] = useState<IReminder[]>([]);

  function dec2hex(dec: number) {
    return dec.toString(16).padStart(2, "0");
  }
  function generateId(len: number) {
    var arr = new Uint8Array((len || 20) / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join("");
  }

  const handleReminders = (product: string, category: string) => {
    let categoriesCopy = [...listReminders];
    let categoryObj = categoriesCopy.find(
      (obj) => obj.categoryName === category
    );

    if (categoryObj) {
      categoryObj.products.push({
        id: generateId(15),
        name: product,
      });
    } else {
      categoriesCopy.push({
        id: generateId(15),
        categoryName: category,
        products: [
          {
            id: generateId(15),
            name: product,
          },
        ],
      });
    }
    // Update state
    setListReminders(categoriesCopy);
  };

  // SDK
  const {
    completion,
    handleSubmit,
    input,
    handleInputChange,
    isLoading,
    setInput,
  } = useCompletion({
    api: "/api/completion",
    onFinish: (product, categories) => {
      setInput("");
      handleReminders(product, categories);
    },
  });

  const moveProductToChecked = (productId: string, categoryId: string) => {
    // Copy current states
    let categoriesCopy = [...listReminders];
    let checkedProductsCopy = [...checkedProducts];

    // Find and remove product from categories
    let categoryObj = categoriesCopy.find(
      (category) => category.id === categoryId
    );
    if (categoryObj) {
      let productIndex = categoryObj.products.findIndex(
        (product) => product.id === productId
      );
      if (productIndex !== -1) {
        let product = categoryObj.products[productIndex];
        categoryObj.products.splice(productIndex, 1);

        // Remove category from categories if it has no products
        if (categoryObj.products.length === 0) {
          categoriesCopy = categoriesCopy.filter(
            (cat) => cat.id !== categoryId
          );
        }

        // Add product to checkedProducts
        let checkedCategoryObj = checkedProductsCopy.find(
          (category) => category.categoryName === categoryObj?.categoryName
        );
        if (checkedCategoryObj) {
          checkedCategoryObj.products.push(product);
        } else {
          checkedProductsCopy.push({
            id: generateId(15),
            categoryName: categoryObj.categoryName,
            products: [product],
          });
        }
      }
    }

    // Update states
    setListReminders(categoriesCopy);
    setCheckedProducts(checkedProductsCopy);
  };

  const saveProductEdited = (objProductToEdited: ISaveProductEdited) => {
    const listCopy = [...listReminders];
    const categoryObj = listCopy.find(
      (obj) => obj.id === objProductToEdited.categoryId
    );

    if (categoryObj) {
      const productObj = categoryObj.products.find(
        (product) => product.id === objProductToEdited.productId
      );

      if (productObj) {
        productObj.name = objProductToEdited.productEdited;
      }
    }
    setListReminders(listCopy);
  };

  const saveCategoryEdited = (objCategoryToEdit: ISaveCategoryEdited) => {
    const listReminderCopy = [...listReminders];
    const categoryObj = listReminderCopy.find(
      (obj) => obj.id === objCategoryToEdit.categoryId
    );

    if (categoryObj) {
      categoryObj.categoryName = objCategoryToEdit.categoryEdited;
    }

    setListReminders(listReminderCopy);
  };

  return (
    <main
      className={`flex w-full min-h-screen flex-col justify-between p-4 ${inter.className}`}>
      <p>Current state: {isLoading ? "Generating..." : "Ready"}</p>
      <form
        onSubmit={handleSubmit}
        className="flex w-full h-screenH flex-col relative">
        {listReminders.map((item) => (
          <div
            className="flex flex-col divide-gray-00 divide-y-2 divide-y-reverse"
            key={item.id}>
            <Reminders
              saveCategoryEdited={saveCategoryEdited}
              category={item}
              moveProductToChecked={moveProductToChecked}
              saveProductEdited={saveProductEdited}
            />
            <div></div>
          </div>
        ))}
        <label htmlFor="primary-input" className="flex flex-col">
          <input
            className="w-full bg-transparent p-2 text-white focus:outline-none absolute bottom-0"
            value={input}
            type="text"
            id="primary-input"
            name="primary-input"
            placeholder="Enter your prompt..."
            onChange={handleInputChange}
          />
          <button type="submit"></button>
        </label>
      </form>
    </main>
  );
}
