"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faEye } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import NavSideEmp from "../components/NavSideEmp";

const formatDateString = (dateString) => {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  const date = new Date(dateString).toLocaleDateString(undefined, options);
  return date;
};

const formatDateDisplay = (dateString) => {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return new Date(dateString).toLocaleDateString("en-GB", options);
};

const ReceivedTaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [viewTask, setViewTask] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Add a loading state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [completeImageUrl, setPreviewImageUrl] = useState("");

  let serialNumber = 1;

  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(15); // Define tasks to show per page

  const calculateSerialNumber = (index) => {
    return index + (currentPage - 1) * tasksPerPage + 1;
  };

  const handlePicturePreview = (imageUrl) => {
    const completeImageUrl = `http://localhost:5000/${imageUrl}`; // Generate the complete image URL
    setPreviewImageUrl(completeImageUrl);
    setIsPreviewModalOpen(true);
  };

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    const loadFormattedTasks = async () => {
      if (typeof window === "undefined") {
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("JWT token not found in localStorage");
        setLoading(false); // Set loading to false on error

        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5000/api/task/listTaskEmp",
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          const formattedTasks = response.data.tasks.map((task) => ({
            ...task,
            deadlineDate: formatDateString(task.deadlineDate),
            startDate: formatDateString(task.startDate),
          }));
          setTasks(formattedTasks);
        } else {
          console.error("Failed to fetch tasks");
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false); // Set loading to false when tasks are fetched
      }
    };

    loadFormattedTasks();
  }, []);

  // Function to set row color and status based on task status and deadline date
  const getStatusColorAndText = (task) => {
    const currentDate = new Date();
    const deadlineDate = new Date(task.deadlineDate);

    if (task.status === "completed") {
      return {
        colorClass:
          " bg-green-200 rounded-full font-semibold text-center text-green-900",
        statusText: "Completed",
      };
    } else if (deadlineDate < currentDate) {
      return {
        colorClass:
          "bg-red-300 rounded-full font-semibold text-center text-red-800",
        statusText: "Overdue",
      };
    } else {
      return {
        colorClass:
          "bg-blue-300 rounded-full font-semibold text-center text-blue-700",
        statusText: "Pending",
      };
    }
  };

  const handleViewClick = async (taskId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `http://localhost:5000/api/task/${taskId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.status === 200) {
        const taskData = response.data;
        console.log(taskData);
        // Format the date for the task
        taskData.deadlineDate = formatDateString(taskData.deadlineDate);
        taskData.startDate = formatDateString(taskData.startDate);

        setViewTask(taskData);
        setIsViewModalOpen(true);
      } else {
        console.error("Failed to fetch task details");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <NavSideEmp />
      <div className="m-5 pl-5 md:pl-72 mt-20">
        <h2 className="text-xl md:text-2xl font-bold mb-4 m-6 text-orange-500">
          Received Task List
        </h2>
        {loading ? (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-gray-700">
            <FontAwesomeIcon
              icon={faSpinner} // Use your FontAwesome spinner icon
              spin // Add the "spin" prop to make the icon spin
              className="text-white text-4xl" // You can customize the size and color
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Sr. No.
                  </th>
                  <th className="px-4 pl-14 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 pl-3 py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 pl-10 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Deadline Date
                  </th>
                  <th className="py-2 pr-10 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.length > 0 ? (
                  currentTasks.map((task,index) => {
                    const { colorClass, statusText } =
                      getStatusColorAndText(task);
                    return (
                      // <tr key={task._id} className={`hover:bg-gray-100 ${colorClass}`}>
                      <tr key={task._id}>
                        <td className="border px-4 py-2 text-center">
                          {calculateSerialNumber(index)}
                        </td>

                        <td className="px-6 py-2 whitespace-nowrap">
                          {task.title}
                        </td>
                        {/* <td className={`px-6 py-2 whitespace-nowrap font-bold`}>{statusText}</td> */}
                        <td className=" px-4 py-2 text-center">
                          <span
                            className={` px-4 py-1 text-left ${colorClass}`}
                          >
                            {statusText}
                          </span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                          {formatDateDisplay(task.startDate)}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                          {formatDateDisplay(task.deadlineDate)}
                        </td>
                        <td className="px-5 py-2 whitespace-nowrap">
                          <FontAwesomeIcon
                            icon={faEye}
                            className="text-blue-500 hover:underline mr-5 cursor-pointer pl-5 text-lg"
                            onClick={() => handleViewClick(task._id)}
                          />
                          {/* <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-sm"
                        onClick={() => handleViewClick(task._id)}
                      >
                        View
                      </button> */}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-2 text-center border">
                      No tasks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <ul className="flex justify-center items-center mt-4">
              {Array.from(
                { length: Math.ceil(tasks.length / tasksPerPage) },
                (_, index) => (
                  <li key={index} className="px-3 py-2">
                    <button
                      onClick={() => paginate(index + 1)}
                      className={`${
                        currentPage === index + 1
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      } px-4 py-2 rounded`}
                    >
                      {index + 1}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        {/* View Task Modal */}
        {isViewModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div
              className="modal-container bg-white w-72 md:w-96 sm:p-6 rounded shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => setIsViewModalOpen(false)}
              >
                {/* Close button icon */}
              </button>
              <div className="p-2 text-center text-sm md:text-base">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">
                  Task Details
                </h3>
                {viewTask && (
                  <div>
                    <p className="mb-1 text-left justify-center">
                      <strong>Title:</strong> {viewTask.title}
                    </p>
                    <p className="mb-1 text-left justify-center">
                      <strong>Description:</strong> {viewTask.description}
                    </p>
                    {/* <p className="mb-2 text-left justify-center">
                      <strong>Status:</strong> {viewTask.status}
                    </p> */}
                    <p className="mb-1 text-left justify-center">
                      <strong>Start Date:</strong> {viewTask.startDate}
                    </p>
                    <p className="mb-1 text-left justify-center">
                      <strong>Start Time:</strong> {viewTask.startTime}
                    </p>
                    <p className="mb-1 text-left justify-center">
                      <strong>Deadline Date:</strong> {viewTask.deadlineDate}
                    </p>
                    <p className="mb-1 text-left justify-center">
                      <strong>End Time:</strong> {viewTask.endTime}
                    </p>
                    {/* <p className="mb-2 text-left justify-center">
                      <strong>Assigned By:</strong> {viewTask.assignedBy?.name}
                    </p> */}
                    <p className="mb-1 text-left justify-center">
                      <strong>Assigned By:</strong>{" "}
                      {viewTask.assignedBy ? viewTask.assignedBy.name : "Self"}
                    </p>
                    <p className="mb-1 text-left justify-center">
                      <strong>Picture:</strong>{" "}
                      {viewTask.picture ? (
                        <button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-1 ml-2"
                          onClick={() => handlePicturePreview(viewTask.picture)}
                        >
                          Preview
                        </button>
                      ) : (
                        "Not Added"
                      )}
                    </p>

                    <p className="mb-2 text-left flex  item-center">
                      {/* <strong>Audio:</strong>{" "}
                      {viewTask.audio ? ( */}
                      <span className="mr-1">
                        {" "}
                        <strong>Audio:</strong>
                      </span>{" "}
                      {viewTask.audio ? (
                        <audio
                          controls
                          className="w=64 h-8 md:w-96 md:h-10 text-lg"
                        >
                          <source
                            src={`http://localhost:5000/${viewTask.audio}`}
                            type="audio/mp3"
                          />
                          Your browser does not support the audio element.
                        </audio>
                      ) : (
                        "Not Added"
                      )}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {isPreviewModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div
              className="modal-container bg-white w-72 md:w-96 p-6 rounded shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => setIsPreviewModalOpen(false)}
              ></button>
              <div className="p-8 text-center">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">
                  Image Preview
                </h3>
                <Image
                  src={completeImageUrl}
                  alt="Preview"
                  width={400} // Adjust the width as needed
                  height={300} // Adjust the height as needed
                />
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded mt-4 mr-2 text-sm md:text-base"
                  onClick={() => setIsPreviewModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ReceivedTaskList;
