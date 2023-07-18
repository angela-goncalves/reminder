import Image from "next/image";
import { useCompletion } from "ai/react";
import { Inter } from "next/font/google";
import { useState, ChangeEvent } from "react";
import Products from "@/Components/Products";

const inter = Inter({ subsets: ["latin"] });

interface IProduct {
  id: string;
  product: string;
}

interface ICategory {
  id: string;
  category: string;
  products: IProduct[];
}

export default function Home() {
  const [list, setList] = useState<ICategory[]>([]);
  const [productEdited, setProductEdited] = useState<any>("");

  function dec2hex(dec: number) {
    return dec.toString(16).padStart(2, "0");
  }
  function generateId(len: number) {
    var arr = new Uint8Array((len || 20) / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join("");
  }

  const handleCategories = (product: string, category: string) => {
    let categoriesCopy = [...list];

    // Check if category already exists
    let categoryObj = categoriesCopy.find((obj) => obj.category === category);

    if (categoryObj) {
      // If category exists, add product to that category
      categoryObj.products.push({
        id: generateId(15),
        product: product,
      });
    } else {
      // If category doesn't exist, create new category and product array
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

    // Update state
    setList(categoriesCopy);
  };

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
      handleCategories(product, categories);
    },
  });

  const saveEdit = (
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
    console.log("edition", listCopy);
    setList(listCopy);
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
      <div className="mx-auto flex w-full max-w-md flex-col space-y-5 py-24">
        <p>Current state: {isLoading ? "Generating..." : "Ready"}</p>
        <form onSubmit={handleSubmit}>
          {list.map((item) => (
            <div className="flex flex-col" key={item.category}>
              <h3>{item.category}</h3>
              {item.products.map((product, i) => {
                return (
                  <Products
                    key={product.id}
                    product={product}
                    saveEdit={saveEdit}
                    categoryId={item.id}
                    productEdited={productEdited}
                    setProductEdited={setProductEdited}
                  />
                );
              })}
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
