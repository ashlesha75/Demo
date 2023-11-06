'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faPenToSquare, faTrash, faEye, faSpinner, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { format, parse, isBefore } from 'date-fns';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import NavSideEmp from '../components/NavSideEmp';



const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const ShareButton = ({ task }) => {
    const [assignedByName, setAssignedByName] = useState('');

    const fetchAssignedByName = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`http://localhost:5000/api/task/${task._id}`, {
                headers: {
                    Authorization: token,
                },
            });

            if (response.status === 200 && response.data.assignedBy) { // Check if assignedBy exists
                setAssignedByName(response.data.assignedBy.name);
            } else {
                console.error('No assignedBy or name found in the task');
            }

        } catch (error) {
            console.error('Error fetching assignedBy name:', error);
        }
    };

    const handleShareClick = () => {
        const recipient = task.phoneNumber;
        const title = task.title;
        const description = task.description;
        const startDate = task.startDate;
        const assignedBy = assignedByName; // Use the fetched name
        const endDate = new Date(task.deadlineDate);
        const formattedEndDate = endDate.toLocaleDateString('en-GB');

        const message = `*New Task is created by : ${assignedBy}*%0A%0A*Task Title:* ${title}%0A*Description:* ${description}%0A*Start Date:* ${startDate}%0A*End Date:* ${formattedEndDate}%0A*Assigned By:* ${assignedBy}`;

        const whatsappWebURL = `https://web.whatsapp.com/send?phone=${recipient}&text=${message}`;

        window.open(whatsappWebURL);
    };

    useEffect(() => {
        fetchAssignedByName();
    }, []);

    return (
        <button
            onClick={handleShareClick}
            className="text-green-800 hover:underline cursor-pointer"
        >
            <FontAwesomeIcon icon={faShareNodes} />
        </button>
    );
};

const sendTaskEmp = () => {
    const [tasks, setTasks] = useState([]);
    const [viewTask, setViewTask] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [deleteTaskId, setDeleteTaskId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loading, setLoading] = useState(true); // Add a loading state
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [completeImageUrl, setPreviewImageUrl] = useState('');


    let serialNumber = 1;

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTasks, setFilteredTasks] = useState([]);
    const router = useRouter()


    const handlePicturePreview = (imageUrl) => {
        const completeImageUrl = `http://localhost:5000/${imageUrl}`; // Generate the complete image URL
        console.log(completeImageUrl)
        setPreviewImageUrl(completeImageUrl);
        setIsPreviewModalOpen(true);
    };

    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
    };


    useEffect(() => {
        const fetchAllTasks = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get('http://localhost:5000/api/task/list/subemployee/sendTasks', {
                    headers: {
                        Authorization: token,
                    },
                });

                if (response.status === 200) {
                    if (Array.isArray(response.data.tasks)) {
                        const currentDate = new Date();
                        const tasksWithAssignedNames = await Promise.all(
                            response.data.tasks.map(async (task) => {
                                try {
                                    const employeeResponse = await axios.get(`http://localhost:5000/api/subemployee/${task.assignTo}`, {
                                        headers: {
                                            Authorization: token,
                                        },
                                    });

                                    if (employeeResponse.status === 200) {
                                        task.assigneeName = employeeResponse.data.name;
                                    }
                                } catch (error) {
                                    // If the employee is not found, set assigneeName as 'Employee Not Found'
                                    task.assigneeName = 'Employee Not Found';
                                }

                                task.startDate = formatDate(task.startDate);
                                const formattedDeadlineDate = format(new Date(task.deadlineDate), 'dd/MM/yyyy');
                                task.deadlineDate = parse(formattedDeadlineDate, 'dd/MM/yyyy', new Date());

                                // Check if the task is completed or overdue
                                if (task.status === 'completed') {
                                    // Task is completed, no need to check deadline
                                } else if (isBefore(task.deadlineDate, currentDate)) {
                                    task.status = 'overdue';
                                } else {
                                    task.status = 'pending';
                                }

                                return task;
                            })
                        );

                        setTasks(tasksWithAssignedNames);
                    } else {
                        console.error('API response is not an array:', response.data);
                    }
                } else {
                    console.error('Failed to fetch tasks');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllTasks();
    }, []);

    useEffect(() => {
        const filtered = tasks.filter((task) => {
            const assigneeName = task.assigneeName.toLowerCase();
            const startDate = task.startDate.toLowerCase();
            const deadlineDate = formatDate(task.deadlineDate);
            const status = task.status.toLowerCase();
            const title = task.title.toLowerCase();
            const query = searchQuery.toLowerCase();

            return (
                assigneeName.includes(query) ||
                title.includes(query) ||
                status.includes(query) ||
                startDate.includes(query) ||
                deadlineDate.includes(query)
            );
        });

        setFilteredTasks(filtered);
    }, [searchQuery, tasks]);

    const handleDeleteClick = (taskId) => {
        setDeleteTaskId(taskId);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.delete(`http://localhost:5000/api/task/delete/${deleteTaskId}`, {
                headers: {
                    Authorization: token,
                },
            });

            if (response.status === 200) {
                console.log('Task deleted successfully');
                setIsDeleteModalOpen(false);
                setTasks((prevTasks) => prevTasks.filter((task) => task._id !== deleteTaskId));
            } else {
                console.error('Failed to delete task');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // const handleEdit = (taskId) => {
    //     router.push(`/editForm/${taskId}`);
    // };


    const handleViewClick = async (taskId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`http://localhost:5000/api/task/${taskId}`, {
                headers: {
                    Authorization: token,
                },
            });

            if (response.status === 200) {
                const taskData = response.data;
                taskData.startDate = formatDate(taskData.startDate);
                taskData.deadlineDate = formatDate(taskData.deadlineDate);

                if (taskData.assignTo) {
                    try {
                        const employeeResponse = await axios.get(`http://localhost:5000/api/subemployee/${taskData.assignTo}`, {
                            headers: {
                                Authorization: token,
                            },
                        });

                        if (employeeResponse.status === 200) {
                            taskData.assigneeName = employeeResponse.data.name;
                        }
                    } catch (error) {
                        console.error('Error fetching assignee details:', error);
                        taskData.assigneeName = 'Employee Not Found';
                    }
                } else {
                    taskData.assigneeName = 'Not Assigned';
                }

                console.log('Picture URL:', taskData.picture);
                console.log('Audio URL:', taskData.audio);

                setViewTask(taskData);
                setIsViewModalOpen(true);
            } else {
                console.error('Failed to fetch task details');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <>
            <NavSideEmp />
            <div className="m-5 pl-0 md:pl-64 mt-20">
                <h1 className="text-xl md:text-2xl font-bold mb-4 text-orange-500 text-center md:text-left">Send Tasks</h1>
                <div className="flex justify-center items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search Tasks"
                        className="px-3 py-1 border border-gray-400 rounded-full w-full md:w-96"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                    />
                </div>


                <div className="relative mb-16 md:mb-16">
                    <button
                        className="bg-orange-500 text-white font-bold py-1 px-5 md:px-7 rounded-lg absolute top-2 right-3"
                        onClick={() => router.push('/taskForm')}
                    >
                        Add Task
                    </button>
                </div>


                {loading ? (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-gray-700">
                        <FontAwesomeIcon
                            icon={faSpinner}
                            spin
                            className="text-white text-4xl"
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className='bg-orange-400 text-white'>
                                <tr>
                                    <th className="px-4 py-2 text-center">Sr.No.</th>
                                    <th className="px-4 py-2 text-center">Title</th>
                                    <th className="px-4 py-2 text-center">Status</th>
                                    <th className="px-4 py-2 text-center">StartDate</th>
                                    <th className="px-4 py-2 text-center">Deadline</th>
                                    <th className="px-4 py-2 text-center">AssignTo</th>
                                    <th className="px-4 py-2 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => (
                                    <tr key={task._id} className="hover:bg-gray-100">
                                        <td className="border px-4 py-2 text-center">{serialNumber++}</td>
                                        <td className="border px-4 py-2">{task.title}</td>
                                        <td className="text-center border px-2 py-1">
                                            <span className={`rounded-full font-semibold px-5 py-1 ${task.status === 'completed' ? 'text-green-800 bg-green-200' :
                                                task.status === 'overdue' ? 'text-red-800 bg-red-200' :
                                                    task.status === 'pending' ? 'text-blue-800 bg-blue-200' :
                                                        ''
                                                }`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="border px-4 py-2">{task.startDate}</td>
                                        <td className="border px-4 py-2">{formatDate(task.deadlineDate)}</td>
                                        <td className="border px-4 py-2">{task.assigneeName}</td>
                                        <td className="border px-4 py-2">
                                            {/* <FontAwesomeIcon
                                                icon={faPenToSquare}
                                                className="text-orange-500 hover:underline mr-3 cursor-pointer"
                                                onClick={() => handleEdit(task._id)}
                                            /> */}
                                            <div style={{display:'flex'}}>
                                            <FontAwesomeIcon
                                                icon={faEye}
                                                className="text-blue-500 hover:underline mr-3 cursor-pointer"
                                                onClick={() => handleViewClick(task._id)}
                                            />
                                            <FontAwesomeIcon
                                                icon={faTrash}
                                                className="text-red-500 hover:underline mr-3 cursor-pointer"
                                                onClick={() => handleDeleteClick(task._id)}
                                            />
                                            <ShareButton task={task} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                                ) : (
                                    <tr>
                                      <td colSpan="8" className="px-4 py-2 text-center border">
                                        No any task.
                                      </td>
                                    </tr>
                                  )
                                }
                            </tbody>
                        </table>
                    </div>
                )}

                {isViewModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <div className="modal-container bg-white w-72 md:w-96 p-2 md:p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>

                            <div className="p-2 text-center text-sm md:text-base">
                                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400 text-center">Task Details</h3>
                                {viewTask && (
                                    <div>
                                        <p className="mb-2 text-left justify-center">
                                            <strong>AssignTo:</strong> {viewTask.assigneeName}
                                        </p>
                                        <p className="mb-2 text-left justify-center">
                                            <strong>Title:</strong> {viewTask.title}
                                        </p>
                                        <p className="mb-2 text-left justify-center">
                                            <strong>Description:</strong> {viewTask.description}
                                        </p>
                                        <p className="mb-2 text-left justify-center">
                                            <strong>Date:</strong> {viewTask.startDate}
                                        </p>
                                        <p className="mb-2 text-left justify-center">
                                            <strong>Start Time:</strong> {viewTask.startTime}
                                        </p>
                                        <p className="mb-2 text-left justify-center">
                                            <strong>DeadLine:</strong> {viewTask.deadlineDate}
                                        </p>
                                        <p className="mb-2 text-left justify-center">
                                            <strong>End Time:</strong> {viewTask.endTime}
                                        </p>
                                        <p className="mb-2 text-left justify-center">
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


                                        <p className="mb-2 text-left flex items-center">
                                            {/* <strong>Audio:</strong>{" "} */}
                                            <span className='mr-1 '><strong>Audio:</strong></span>{" "}
                                            {viewTask.audio ? (
                                                <audio controls className='w=64 h-8 md:w-96 md:h-10 text-lg'>
                                                    <source src={`http://localhost:5000/${viewTask.audio}`} type="audio/mp3" />
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
                                    className="bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded mt-4 mr-2"
                                    onClick={() => setIsViewModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {isDeleteModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <div className="modal-container bg-white sm:w-96 sm:p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setIsDeleteModalOpen(false)}></button>
                            <div className="p-5 text-center">
                                {/* <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Confirm Deletion</h3> */}
                                <FontAwesomeIcon icon={faCircleExclamation} className='text-3xl md:text-5xl text-orange-600 mt-2' />
                                <p className="mb-3 text-center justify-center mt-3">
                                    Delete this task?
                                </p>
                                <button
                                    type="button"
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 mr-2 text-xs md:text-base"
                                    onClick={() => handleDelete()}
                                >
                                    Confirm
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mt-4 text text-xs md:text-base"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {isPreviewModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <div className="modal-container bg-white w-64 md:w-80 p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setIsPreviewModalOpen(false)}></button>
                            <div className="p-2 text-center">
                                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Image Preview</h3>
                                <Image
                                    src={completeImageUrl}
                                    alt="Preview"
                                    width={400}
                                    height={300}
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

export default sendTaskEmp;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import NavSideEmp from '../components/NavSideEmp';

// const SendTaskEmp = () => {
//     const [tasks, setTasks] = useState([]);

//     useEffect(() => {
//         const fetchTasks = async () => {
//             try {
//                 const token = localStorage.getItem('authToken');
//                 const headers = { Authorization: token };
//                 const response = await axios.get('http://localhost:5000/api/task/list/subemployee/sendTasks', { headers });

//                 setTasks(response.data.tasks);
//             } catch (error) {
//                 console.error('Error fetching tasks:', error);
//             }
//         };

//         fetchTasks();
//     }, []);

//     return (
//         <>

//             <NavSideEmp />
//             <div className="m-5 pl-0 md:pl-64 mt-20">
//                 <h1 className="text-xl md:text-2xl font-bold mb-4 text-orange-500 text-center md:text-left">Send Tasks</h1>
//                 <div className="overflow-x-auto">
//                     <table className="min-w-full border-collapse border border-gray-300">
//                         <thead className='bg-orange-400 text-white'>
//                             <tr>
//                                 <th className="px-4 py-2 text-center">Sr.No.</th>
//                                 <th className="px-4 py-2 text-center">Title</th>
//                                 <th className="px-4 py-2 text-center">Status</th>
//                                 {/* <th className="px-4 py-2 text-center">Description</th> */}
//                                 <th className="px-4 py-2 text-center">StartDate</th>
//                                 <th className="px-4 py-2 text-center">Deadline</th>
//                                 <th className="px-4 py-2 text-center">AssignTo</th>
//                                 {/* <th className="px-4 py-2 text-center">Actions</th> */}
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {tasks.map((task, index) => (
//                                 <tr key={index}>
//                                     <td className="border border-gray-300 p-2">{index+1}</td>
//                                     <td className="border border-gray-300 p-2">{task.title}</td>
//                                     <td className="border border-gray-300 p-2">{task.status}</td>
//                                     {/* <td className="border border-gray-300 p-2">{task.description}</td> */}
//                                     <td className="border border-gray-300 p-2">{task.startDate}</td>
//                                     <td className="border border-gray-300 p-2">{task.deadLineDate}</td>
//                                     <td className="border border-gray-300 p-2">{task.assignTo}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default SendTaskEmp;
