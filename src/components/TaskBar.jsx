import { useEffect, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Dialog } from "@mui/material";
import { invoke } from "@tauri-apps/api/tauri";

export default function TaskBar({ heapData, setHeapData }) {
  const [deleteTaskName, setDeleteTaskName] = useState("");

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  async function deleteTask() {
    try {
      const response = await invoke("delete_task", {
        name: deleteTaskName,
      });
      console.log(response);
      handleClose()
    } catch (error) {
      console.error("Error invoking command:", error);
      handleClose()
    }
  }

  useEffect(()=>{
    console.log(deleteTaskName)
  },[deleteTaskName])

  return (
    <div className="bg-white p-4">
      <Dialog open={open} onClose={handleClose}
      className=""
      >
        Are you sure, do you want to delete {deleteTaskName} ?
        <button onClick={deleteTask}>Yes</button>
        <button onClick={handleClose}>No</button>
      </Dialog>
      <div>Tasks :</div>
      <div className="flex flex-col gap-4">
        {heapData != undefined && heapData.length > 0 ? (
          heapData.map((element, index) => (
            <div
              key={index}
              className="flex flex-row justify-between px-2 bg-emerald-300 rounded-md"
            >
              <div className="p-2">{element._name}</div>
              <div
                className="text-center flex justify-center align-middle h-full"
                onClick={() => {
                  setDeleteTaskName(element._name);
                  setOpen(true)
                }}
              >
                <RiDeleteBin6Line className="w-5 h-5 mt-2 mr-2" />
              </div>
            </div>
          ))
        ) : (
          <p>No task available!</p>
        )}
      </div>
    </div>
  );
}
