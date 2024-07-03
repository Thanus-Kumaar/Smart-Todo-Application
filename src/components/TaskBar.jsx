import { useEffect, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { SiTicktick } from "react-icons/si";
import { CiEdit } from "react-icons/ci";
import { Dialog } from "@mui/material";
import { invoke } from "@tauri-apps/api/tauri";
import AddTask from "./AddTask";

export default function TaskBar({ heapData, setHeapData }) {
  const [deleteTaskName, setDeleteTaskName] = useState("");

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const [openEdit, setOpenEdit] = useState(false);
  const handleEditClose = () => {
    setOpenEdit(false);
  };

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [timeToConsume, setTime] = useState(0);
  const [oldName, setOldName] = useState("");

  const [toDelete, setToDelete] = useState(false);

  async function deleteTask() {
    try {
      const response = await invoke("delete_task", {
        name: deleteTaskName,
      });
      console.log(response);
      handleClose();
    } catch (error) {
      console.error("Error invoking command:", error);
      handleClose();
    }
  }

  async function getEditDetails(editTaskName) {
    try {
      const response = await invoke("send_task_details", {
        name: editTaskName,
      });
      console.log(response);
      setName(response._name);
      setDate(response._date);
      setTime(response._completion_time);
      setCategory(response._category);
      setOpenEdit(true);
    } catch (error) {
      console.error("Error invoking command:", error);
    }
  }

  function convertToDate(date) {
    let dateString = "";
    let dateList = date.split("-");
    console.log(dateList);
    switch (dateList[1]) {
      case "01":
        dateString = dateList[2] + " Jan " + dateList[0];
        break;
      case "02":
        dateString = dateList[2] + " Feb " + dateList[0];
        break;
      case "03":
        dateString = dateList[2] + " Mar " + dateList[0];
        break;
      case "04":
        dateString = dateList[2] + " Apr " + dateList[0];
        break;
      case "05":
        dateString = dateList[2] + " May " + dateList[0];
        break;
      case "06":
        dateString = dateList[2] + " Jun " + dateList[0];
        break;
      case "07":
        dateString = dateList[2] + " Jly " + dateList[0];
        break;
      case "08":
        dateString = dateList[2] + " Aug " + dateList[0];
        break;
      case "09":
        dateString = dateList[2] + " Sep " + dateList[0];
        break;
      case "10":
        dateString = dateList[2] + " Oct " + dateList[0];
        break;
      case "11":
        dateString = dateList[2] + " Nov " + dateList[0];
        break;
      case "12":
        dateString = dateList[2] + " Dec " + dateList[0];
        break;
    }
    return dateString;
  }

  useEffect(() => {
    console.log(deleteTaskName);
  }, [deleteTaskName]);

  return (
    <div className="bg-blue-400 p-4">
      <Dialog open={open} onClose={handleClose}>
        <div className="p-4 flex flex-col">
          <div>
            Are you sure, do you want to {toDelete ? "delete " : "mark "}{" "}
            <b>{deleteTaskName}</b> {toDelete ? "" : " as completed"} ?
          </div>
          <div className="w-full p-4 flex flex-row justify-evenly">
            <button
              onClick={deleteTask}
              className="bg-green-400 px-6 py-2 rounded-md"
            >
              Yes
            </button>
            <button
              onClick={handleClose}
              className="bg-red-400 px-6 py-2 rounded-md"
            >
              No
            </button>
          </div>
        </div>
      </Dialog>
      <AddTask
        open={openEdit}
        setOpen={setOpenEdit}
        name={name}
        setName={setName}
        category={category}
        setCategory={setCategory}
        date={date}
        setDate={setDate}
        timeToConsume={timeToConsume}
        setTime={setTime}
        isEdit={true}
        oldName={oldName}
      />
      <div className="p-2 italic font-semibold text-[25px] ">CURRENT TASKS</div>
      <div className="flex flex-col gap-4">
        {heapData != undefined && heapData.length > 0 ? (
          heapData.map((element, index) => (
            <div
              key={index}
              className="flex flex-row justify-between px-2 bg-blue-200 rounded-md hover:scale-[1.01] transition duration-75"
            >
              <div className="flex flex-col gap-0 p-2">
                <div className="text-lg">{element._name}</div>
                <div className="text-xs italic">
                  {convertToDate(element._date)}&nbsp;&nbsp;|&nbsp;&nbsp;
                  {element._completion_time} hrs
                </div>
              </div>
              <div className="flex flex-row gap-4">
                <div
                  className="text-center flex justify-center align-middle h-full hover:scale-[1.2] transition duration-100"
                  onClick={() => {
                    setName("");
                    setDate("");
                    setTime("");
                    setCategory("");
                    setOldName(element._name);
                    getEditDetails(element._name);
                  }}
                >
                  <CiEdit className="w-7 h-7 mt-4 mr-2" />
                </div>
                <div
                  className="text-center flex justify-center align-middle h-full hover:scale-[1.2] transition duration-100"
                  onClick={() => {
                    setToDelete(false);
                    setDeleteTaskName(element._name);
                    setOpen(true);
                  }}
                >
                  <SiTicktick className="w-5 h-5 mt-5 mr-2" />
                </div>
                <div
                  className="text-center flex justify-center align-middle h-full hover:scale-[1.2] transition duration-100"
                  onClick={() => {
                    setToDelete(true);
                    setDeleteTaskName(element._name);
                    setOpen(true);
                  }}
                >
                  <RiDeleteBin6Line className="w-6 h-6 mt-4 mr-2" />
                </div>
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
