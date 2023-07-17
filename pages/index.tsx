import Image from "next/image";
import { useCompletion } from "ai/react";
import { Inter } from "next/font/google";
import { useState, ChangeEvent } from "react";

const inter = Inter({ subsets: ["latin"] });

interface IProduct {
  category: string;
  product: string[];
}

export default function Home() {
  const [list, setList] = useState<IProduct[]>([]);
  const [editProduct, setEditProduct] = useState<string>("");
  const [checkedInput, setCheckedInput] = useState<Record<string, boolean>>({});

  const handleCategories = (product: string, category: string) => {
    let productsCopy = [...list];

    // Check if category already exists
    let categoryObj = productsCopy.find((obj) => obj.category === category);

    if (categoryObj) {
      // If category exists, add product to that category
      categoryObj.product.push(product);
    } else {
      // If category doesn't exist, create new category and product array
      productsCopy.push({
        category: category,
        product: [product],
      });
    }
    // Update state
    setList(productsCopy);
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

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
      <div className="mx-auto flex w-full max-w-md flex-col space-y-5 py-24">
        <p>Current state: {isLoading ? "Generating..." : "Ready"}</p>
        <form onSubmit={handleSubmit}>
          {list.map((item) => (
            <div className="flex flex-col" key={item.category}>
              <h3>{item.category}</h3>
              {item.product.map((product, i) => {
                console.log(checkedInput);
                return (
                  <div key={product + i} className="flex">
                    <label className="flex">
                      <input
                        id={`${product}${i}`}
                        name={`${product}${i}`}
                        type="checkbox"
                        value={product}
                        checked={checkedInput[`${product}${i}`] || false}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const { checked, id } = e.target;
                          console.log("id", id);
                          setCheckedInput(
                            (prevState: Record<string, boolean>) => ({
                              ...prevState,
                              [id]: checked,
                            })
                          );
                        }}
                      />
                      {editProduct !== product ? (
                        <p
                          style={{
                            textDecoration: checkedInput[`${product}${i}`]
                              ? "line-through"
                              : "none",
                          }}>
                          {product}
                        </p>
                      ) : (
                        <input
                          className="border-none p-2 bg-transparent text-white"
                          value={product}
                          type="text"
                          // onChange={}
                        />
                      )}
                    </label>
                    <button
                      type="button"
                      className="w-auto border mx-5 p-1"
                      onClick={() => {
                        setEditProduct(product);
                      }}>
                      edit
                    </button>
                  </div>
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
