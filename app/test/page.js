'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/app/components/Navbar';
import Sidebar from '@/app/components/Sidebar';
import AdminSidebar from '@/app/components/AdminSidebar';
import Image from 'next/image';
import NavSide from '@/app/components/NavSide';

const getCurrentTimeIn12HourFormat = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

const EditForm = ({ params }) => {
    const router = useRouter();
    const { taskId } = params;
    const [taskData, setTaskData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [assignees, setAssignees] = useState([]); // Define the assignees state variable
    const [successMessage, setSuccessMessage] = useState(''); // Initialize success message state
    const [subemployees, setSubemployees] = useState([]);
    const [pictureFile, setPictureFile] = useState(null); // State variable for picture file
    const [audioFile, setAudioFile] = useState(null); // State variable for audio file
    const [showPicturePreview, setShowPicturePreview] = useState(false);
    const [currentStartTime, setCurrentStartTime] = useState(getCurrentTimeIn12HourFormat());
    const [currentEndTime, setCurrentEndTime] = useState(getCurrentTimeIn12HourFormat());



    useEffect(() => {
        // Fetch task data by taskId when the component mounts
        const fetchTaskData = async () => {
            try {
                const authToken = localStorage.getItem('authToken'); // Retrieve the authToken from localStorage

                const response = await axios.get(`http://localhost:5000/api/task/${taskId}`, {
                    headers: {
                        Authorization: authToken, // Include the authToken in the headers
                    },
                });
                console.log(response.data)
                if (response.status === 200) {
                    setTaskData(response.data);
                } else {
                    console.error('Failed to fetch task data');
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Error:', error);
                setIsLoading(false);
            }
        };

        const fetchAssignees = async () => {
            axios
                .get('http://localhost:5000/api/employee/subemployees/list', {
                    headers: {
                        Authorization: localStorage.getItem('authToken'), // Include your JWT token here
                    },
                })
                .then((response) => {
                    // Extract subemployee names and IDs from the response
                    const subemployeeList = response.data.map((subemployee) => ({
                        id: subemployee._id,
                        name: subemployee.name,
                    }));
                    setSubemployees(subemployeeList);
                })
                .catch((error) => {
                    console.error('Error fetching subemployees:', error);
                })
        };

        if (taskId) {
            fetchTaskData();
        }

        // Fetch assignees when the component mounts
        fetchAssignees();
    }, [taskId]);
    console.log(taskId)


    const handleFormSubmit = async (e) => {
        e.preventDefault();


        // Make the Fetch API PUT request here
        try {
            const authToken = localStorage.getItem('authToken'); // Retrieve the authToken from localStorage
            console.log(authToken);

            const formData = new FormData();
            formData.append('picture', pictureFile);
            formData.append('audio', audioFile);
            formData.append('taskData', JSON.stringify(taskData));

            const response = await axios.put(`http://localhost:5000/api/task/edit/${taskId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: authToken,
                },
            });


            if (response.status === 200) {
                const data = response.data;
                console.log('Task updated successfully:', data);
                router.push(`/taskList`);
            } else {
                console.error('Failed to update task');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };


    const handlePictureChange = (e) => {
        // Set the selected picture file in the state
        setPictureFile(e.target.files[0]);
        setTaskData({ ...taskData, picture: e.target.files[0].name });

    };

    const handleAudioChange = (e) => {
        // Set the selected audio file in the state
        setAudioFile(e.target.files[0]);
        setTaskData({ ...taskData, audio: e.target.files[0].name });

    };


    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {/* <Navbar /> */}
            {/* <Sidebar/> */}
            {/* <AdminSidebar /> */}
            <NavSide />

            <div className="w-full md:flex justify-center items-center min-h-screen md:mt-10 md:pl-28 bg-slate-50">
                <div className="w-full md:max-w-2xl overflow-x-auto border border-gray-200 rounded-lg p-5 bg-white mt-16">
                    {successMessage && (<div className="mb-4 text-green-500">{successMessage}</div>)}

                    <div className=" col-span-2 mb-3 md:text-2xl font-bold text-orange-500 text-left">Edit Task</div>
                    <div className="mb-1">
                        <label htmlFor="title" className="block font-semibold text-xs lg:text-sm">Title</label>
                        <input
                            type="text"
                            id="title"
                            className="border-2 border-gray-200 rounded-md px-3 py-2 w-full "
                            placeholder="Title"
                            value={taskData.title || ''}
                            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-1">
                        <label htmlFor="description" className="block font-semibold text-xs lg:text-sm">Description</label>
                        <textarea
                            id="description"
                            className="border-2 border-gray-200 rounded-md px-3 py-2 w-full"
                            placeholder="Description"
                            value={taskData.description || ''}
                            onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                            rows="4"
                        />
                    </div>

                    <div className="mb-2">
                        <label htmlFor="assignTo" className="block font-semibold text-xs lg:text-sm">Assign To</label>
                        <select
                            id="assignTo"
                            className="border-2 border-gray-200 rounded-md px-3 py-1 w-full"
                            value={taskData.assigneeName ? taskData.assigneeName._id : ''}
                            onChange={(e) => {
                                const selectedSubemployee = subemployees.find((subemployee) => subemployee.id === e.target.value);
                                setTaskData({ ...taskData, assigneeName: selectedSubemployee });
                            }}
                        >
                            <option value="">Select an Assign To</option>
                            {subemployees.map((subemployee) => (
                                <option key={subemployee.id} value={subemployee.id}>
                                    {subemployee.name}
                                </option>
                            ))}
                        </select>
                    </div>


                    <form onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-4">
                        <div className="mb-1">
                            <label htmlFor="startDate" className="block font-semibold text-xs lg:text-sm">Start Date</label>
                            <input
                                type="date"
                                id="startDate"
                                className="border-2 border-gray-200 rounded-md px-2 py-1 w-32 md:w-full" // Adjust the width for mobile and larger screens
                                value={taskData.startDate ? taskData.startDate.slice(0, 10) : ''}
                                onChange={(e) => setTaskData({ ...taskData, startDate: e.target.value })}
                            />
                        </div>

                        {/* <div className="mb-1">
                            <label htmlFor="startTime" className="block font-semibold text-xs lg:text-sm md:pl-7">Start Time</label>
                            <input
                                type="time"
                                id="startTime"
                                className="w-full px-4 py-1.5 border rounded-lg focus:outline-none focus:border-blue-400"
                                value={taskData.startTime || ''}
                                onChange={(e) => setTaskData({ ...taskData, startTime: e.target.value })}
                            />
                        </div> */}

                        <div className="mb-2">
                            <label htmlFor="startTime" className="block font-semibold text-xs lg:text-sm md:pl-7">
                                Start Time / सुरू वेळ <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center md:pl-6">
                                <select
                                    name="startHour"
                                    value={taskData.startTime.split(':')[0]}
                                    onChange={(e) => {
                                        const newHour = e.target.value;
                                        setCurrentStartTime(`${newHour}:${currentStartTime.split(':')[1]} ${currentStartTime.split(' ')[1]}`);
                                    }}
                                    className="border border-gray-200 rounded-md md:px-2 py-1.5 mr-1"
                                    required
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i === 0 ? '12' : i.toString().padStart(2, '0')}>
                                            {i === 0 ? '12' : i.toString().padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                                <span><strong>: </strong></span>
                                <select
                                    name="startMinute"
                                    value={taskData.startTime.split(':')[1].split(' ')[0]}
                                    onChange={(e) => {
                                        const newMinute = e.target.value;
                                        setCurrentStartTime(`${currentStartTime.split(':')[0]}:${newMinute} ${currentStartTime.split(':')[1].split(' ')[1]}`);
                                    }}
                                    className="border border-gray-200 rounded-md md:px-2 py-1.5 mr-2"
                                    required
                                >
                                    {Array.from({ length: 60 }, (_, i) => (
                                        <option key={i} value={i.toString().padStart(2, '0')}>
                                            {i.toString().padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="startAmPm"
                                    value={taskData.startTime.split(' ')[1]}
                                    onChange={(e) => {
                                        const newAmPm = e.target.value;
                                        setCurrentStartTime(`${currentStartTime.split(':')[0]}:${currentStartTime.split(':')[1].split(' ')[0]} ${newAmPm}`);
                                    }}
                                    className="border border-gray-200 rounded-md md:px-2 py-1.5"
                                    required
                                >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </div>
                        </div>


                        <div className="mb-1">
                            <label htmlFor="deadlineDate" className="block font-semibold text-xs lg:text-sm">Deadline</label>
                            <input
                                type="date"
                                id="deadlineDate"
                                className="border-2 border-gray-200 rounded-md px-2 py-1 w-32 md:w-full" // Adjust the width for mobile and larger screens
                                value={taskData.deadlineDate ? taskData.deadlineDate.slice(0, 10) : ''}
                                onChange={(e) => setTaskData({ ...taskData, deadlineDate: e.target.value })}
                            />
                        </div>


                        <div className="mb-2">
                            <label htmlFor="endTime" className="block font-semibold md:pl-7 text-xs lg:text-sm ">
                                End Time / अंतिम वेळ <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center md:pl-6">
                                <select
                                    name="endHour"
                                    value={taskData.endTime.split(':')[0]}
                                    onChange={(e) => {
                                        const newHour = e.target.value;
                                        setCurrentEndTime(`${newHour}:${currentEndTime.split(':')[1]} ${currentEndTime.split(' ')[1]}`);
                                    }}
                                    className="border border-gray-200 rounded-md md:px-2 py-1.5 mr-1"
                                    required
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i === 0 ? '12' : i.toString().padStart(2, '0')}>
                                            {i === 0 ? '12' : i.toString().padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                                <span><strong>:</strong></span>
                                <select
                                    name="endMinute"
                                    value={taskData.endTime.split(':')[1].split(' ')[0]}
                                    onChange={(e) => {
                                        const newMinute = e.target.value;
                                        setCurrentEndTime(`${currentEndTime.split(':')[0]}:${newMinute} ${currentEndTime.split(':')[1].split(' ')[1]}`);
                                    }}
                                    className="border border-gray-200 rounded-md md:px-2 py-1.5 mr-2"
                                    required
                                >
                                    {Array.from({ length: 60 }, (_, i) => (
                                        <option key={i} value={i.toString().padStart(2, '0')}>
                                            {i.toString().padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="endAmPm"
                                    value={taskData.endTime.split(' ')[1]}
                                    onChange={(e) => {
                                        const newAmPm = e.target.value;
                                        setCurrentEndTime(`${currentEndTime.split(':')[0]}:${currentEndTime.split(':')[1].split(' ')[0]} ${newAmPm}`);
                                    }}
                                    className="border border-gray-200 rounded-md md:px-2 py-1.5 mr-2"
                                    required
                                >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </div>
                        </div>



                        <div className="mb-1">
                            <label htmlFor="picture" className="block font-semibold text-xs lg:text-sm">
                                Picture
                            </label>
                            <input
                                type="file"
                                id="picture"
                                accept="image/*"
                                className="border-2 border-gray-200 rounded-md px-2 py-1 w-32 md:w-full text-xs md:text-sm" // Adjust the width and text size for mobile and larger screens
                                onChange={handlePictureChange}
                            />
                        </div>
                            

                        <div className="mb-1">
                            <label htmlFor="audio" className="block font-semibold text-xs lg:text-sm">
                                Audio
                            </label>
                            <input
                                type="file"
                                id="audio"
                                accept="audio/*"
                                className="border-2 border-gray-200 rounded-md px-2 py-1 w-32 md:w-full text-xs md:text-sm" // Adjust the width and text size for mobile and larger screens
                                onChange={handleAudioChange}
                            />
                        </div>
                            
                            
                        <button
                            type="submit"
                            className="col-span-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mb-4"
                        >
                            Update Task
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditForm;