import { useCompletion } from "ai/react";
import { Inter } from "next/font/google";
import { useState, useEffect } from "react";
import Reminders from "@/Components/Reminders";
import { Skeleton } from "@/Components/UI/skeleton";
import { Separator } from "@/Components/UI/separator";

const inter = Inter({ subsets: ["latin"] });

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

export default function Home() {
  const [listReminders, setListReminders] = useState<IReminder[]>([]);
  const [showNoChecked, setShowNoChecked] = useState<boolean>(false);
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
    const categoriesCopy = [...listReminders];
    const categoryObj = categoriesCopy.find(
      (obj) => obj.categoryName === category
    );

    const isProductEmpy = categoryObj?.products.find(
      (item) => item.name === ""
    );
    if (categoryObj) {
      categoryObj.products.push({
        id: generateId(15),
        name: product,
        isChecked: false,
      });
      if (!isProductEmpy) {
        categoryObj.products.push({
          id: generateId(16),
          name: "",
          isChecked: false,
        });
      }
    } else {
      categoriesCopy.push({
        id: generateId(15),
        categoryName: category,
        products: [
          {
            id: generateId(15),
            name: product,
            isChecked: false,
          },
          {
            id: generateId(16),
            name: "",
            isChecked: false,
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

  const setProductToComplete = (productCategoryIds: ISetProductToComplete) => {
    // Copy current states
    const categoriesCopy = [...listReminders];
    console.log("product", productCategoryIds);
    const categoryObj = categoriesCopy.find(
      (cat) => cat.id === productCategoryIds.categoryId
    );

    if (categoryObj) {
      const productObj = categoryObj.products.find(
        (product) => product.id === productCategoryIds.productId
      );

      if (productObj) {
        productObj.isChecked = !productObj.isChecked;
      }
    }
    setCheckedProducts(categoriesCopy);
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
        if (objProductToEdited.productEdited === "") {
          const productIndex = categoryObj.products.findIndex(
            (product) => product.id === objProductToEdited.productId
          );

          if (productIndex !== -1) {
            categoryObj.products.splice(productIndex, 1);
          }
        }
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

  const CategoriesAndProducts = showNoChecked ? checkedProducts : listReminders;

  return (
    <main
      className={`flex w-full min-h-screen flex-col justify-between p-4 ${inter.className}`}>
      <p>Current state: {isLoading ? "Generating..." : "Ready"}</p>
      <div className="flex w-full h-screenH flex-col relative">
        <button onClick={() => setShowNoChecked(!showNoChecked)}>
          {showNoChecked ? <h3>hide</h3> : <h3>show</h3>}
        </button>
        {CategoriesAndProducts.map((reminder) => {
          return (
            <Reminders
              key={reminder.id}
              showNoChecked={showNoChecked}
              saveCategoryEdited={saveCategoryEdited}
              category={reminder}
              setProductToComplete={setProductToComplete}
              saveProductEdited={saveProductEdited}
            />
          );
        })}
        <form onSubmit={handleSubmit} className="mt-8 absolute bottom-0">
          {isLoading ? (
            <div className="flex p-2">
              <Skeleton className="bg-neutral-600 w-[10px] h-[10px] rounded-full" />
              <Skeleton className="bg-neutral-600 w-[10px] h-[10px] rounded-full" />
              <Skeleton className="bg-neutral-600 w-[10px] h-[10px] rounded-full" />
            </div>
          ) : (
            <label htmlFor="primary-input" className="flex flex-col w-full">
              <input
                className="w-full bg-transparent p-2 text-white focus:outline-none"
                value={input}
                type="text"
                id="primary-input"
                name="primary-input"
                placeholder="Enter your prompt..."
                onChange={handleInputChange}
              />
            </label>
          )}
        </form>
      </div>
    </main>
  );
}
