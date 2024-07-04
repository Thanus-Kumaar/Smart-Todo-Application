import { useState } from "react";
import { Dialog, Alert } from "@mui/material";
import { invoke } from "@tauri-apps/api/tauri";
import { IoCloseCircle } from "react-icons/io5";

export default function AddCategory({
  openAddCat,
  setOpenAddCat,
  newCat,
  setNewCat,
  categoryList,
}) {
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("");
  const [displayAlert, setDisplayAlert] = useState(false);

  async function addCategory() {
    try {
      console.log("initialising add category...");
      const response = await invoke("add_category_from_frontend", {
        categoryName: newCat,
      });
      console.log(response);
      setAlertMsg("Added category successfully !");
      setAlertType("success");
      setDisplayAlert(true);
      setTimeout(() => {
        setDisplayAlert(false);
      }, 3000);
    } catch (error) {
      console.log("Error: ", error);
      setAlertMsg(error);
      setAlertType("error");
      setDisplayAlert(true);
      setTimeout(() => {
        setDisplayAlert(false);
      }, 3000);
    }
  }

  function handleCatClose() {
    setOpenAddCat(false);
  }

  async function deleteCategory(catName) {
    try {
      console.log("initialising delete category...");
      const response = await invoke("delete_category_from_frontend", {
        categoryName: catName,
      });
      console.log(response);
    } catch (error) {
      console.log("Error: ", error);
    }
  }
  return (
    <div>
      <Dialog open={openAddCat} onClose={handleCatClose}>
        <Alert
          severity={alertType}
          style={{ display: displayAlert == false ? "none" : "" }}
        >
          {alertMsg}
        </Alert>
        <div className="p-6 w-80">
          <div className="flex flex-col gap-1">
            <label className="block text-sm" htmlFor="catName">
              Category Name
            </label>
            <input
              className="bg-slate-200 pl-2 p-1 border-black border-[1px] rounded-sm"
              value={newCat}
              onChange={(e) => {
                setNewCat(e.target.value);
              }}
              placeholder="Name"
              type="text"
              name="catName"
            />
            <button
              onClick={() => addCategory()}
              className="p-2 bg-green-300 w-14 mt-2 mx-auto rounded-md text-xs disabled:cursor-not-allowed disabled:opacity-70"
              disabled={newCat == "" ? true : false}
            >
              Add
            </button>
          </div>
          <div className="text-center mt-10 font-bold">Current Categories</div>
          <div className="flex flex-row gap-2 flex-wrap mt-4">
            {categoryList != undefined ? (
              categoryList.map((category, index) => (
                <div
                  className="bg-slate-200 rounded-full w-fit px-2 flex flex-row pl-2"
                  key={index}
                >
                  <div>{category}</div>
                  <div onClick={() => deleteCategory(category)}>
                    <IoCloseCircle className="h-4 w-4 mt-1 cursor-pointer ml-2" />
                  </div>
                </div>
              ))
            ) : (
              <div>No categories created!</div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
