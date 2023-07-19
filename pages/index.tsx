import { useCompletion } from "ai/react";
import { Inter } from "next/font/google";
import { useState, ChangeEvent } from "react";
import Reminders from "@/Components/Reminders";

const inter = Inter({ subsets: ["latin"] });

interface IProduct {
  id: string;
  product: string;
}
interface IReminder {
  id: string;
  category: string;
  products: IProduct[];
}

export default function Home() {
  const [list, setList] = useState<IReminder[]>([]);

  function dec2hex(dec: number) {
    return dec.toString(16).padStart(2, "0");
  }
  function generateId(len: number) {
    var arr = new Uint8Array((len || 20) / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join("");
  }

  const handleReminders = (product: string, category: string) => {
    let categoriesCopy = [...list];
    let categoryObj = categoriesCopy.find((obj) => obj.category === category);

    if (categoryObj) {
      categoryObj.products.push({
        id: generateId(15),
        product: product,
      });
    } else {
      categoriesCopy.push({
        id: generateId(15),
        category: category,
        products: [
          {
            id: generateId(15),
            product: product,
          },
        ],
      });
    }
    // // Update state
    setList(categoriesCopy);
  };

  const { handleSubmit, input, handleInputChange, isLoading, setInput } =
    useCompletion({
      api: "/api/completion",
      onFinish: (product, categories) => {
        setInput("");
        handleReminders(product, categories);
      },
    });

  const saveProductEdited = (
    categoryId: string,
    productEdited: string,
    productId: string
  ) => {
    const listCopy = [...list];
    const categoryObj = listCopy.find((obj) => obj.id === categoryId);

    if (categoryObj) {
      const productObj = categoryObj.products.find(
        (product) => product.id === productId
      );

      if (productObj) {
        productObj.product = productEdited;
      }
    }
    setList(listCopy);
  };

  const saveCategoryEdited = (categoryId: string, newValue: string) => {
    const listCopy = [...list];
    const categoryObj = listCopy.find((obj) => obj.id === categoryId);

    if (categoryObj) {
      categoryObj.category = newValue;
    }

    setList(listCopy);
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
      <div className="mx-auto flex w-full max-w-md flex-col space-y-5 py-24">
        <p>Current state: {isLoading ? "Generating..." : "Ready"}</p>
        <form onSubmit={handleSubmit}>
          {list.map((item) => (
            <div className="flex flex-col w-max" key={item.id}>
              <Reminders
                key={item.id}
                saveCategoryEdited={saveCategoryEdited}
                category={item}
                saveProductEdited={saveProductEdited}
              />
            </div>
          ))}
          <input
            className="w-full max-w-md rounded border border-gray-300 p-2 shadow-xl text-black"
            value={input}
            type="text"
            placeholder="Enter your prompt..."
            onChange={handleInputChange}
          />
        </form>
      </div>
    </main>
  );
}
