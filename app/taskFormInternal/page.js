'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import jwt_decode from 'jwt-decode';
import NavSideEmp from '../components/NavSideEmp';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';


// const decodedToken = jwt_decode(localStorage.getItem('authToken'));
// const decodedToken = typeof window !== 'undefined' ? window.localStorage.getItem('authToken') : null;
const decodedToken = jwt_decode(localStorage.getItem('authToken'));


const getCurrentTimeIn12HourFormat = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

const TaskFormInternal = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        deadlineDate: '',
        assignTo: '',
        picture: null,
        audio: null,
        assignedBy: decodedToken.employeeId,
    });

    const [errors, setErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [subemployees, setSubemployees] = useState([]);

    const [currentStartTime, setCurrentStartTime] = useState(getCurrentTimeIn12HourFormat());
    const [currentEndTime, setCurrentEndTime] = useState(getCurrentTimeIn12HourFormat());

    useEffect(() => {
        axios
            .get('http://localhost:5000/api/employee/subemployees/list', {
                headers: {
                    Authorization: localStorage.getItem('authToken'),
                },
            })
            .then((response) => {
                const subemployeeList = response.data
                    .filter((subemployee) => subemployee.adminCompanyName === decodedToken.adminCompanyName) // Filter by admin company
                    .map((subemployee) => ({
                        id: subemployee._id,
                        name: subemployee.name,
                    }));
                setSubemployees(subemployeeList);
            })
            .catch((error) => {
                console.error('Error fetching subemployees:', error);
            });


        // Set current start time when the component mounts
        setCurrentStartTime(getCurrentTimeIn12HourFormat());

        // Set current end time when the component mounts
        setCurrentEndTime(getCurrentTimeIn12HourFormat());
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData({
            ...formData,
            [name]: files[0],
        });
    };


    const handleRemovePicture = () => {
        setFormData({
            ...formData,
            picture: null,
        });
        const fileInput = document.getElementById('picture');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleRemoveAudio = () => {
        setFormData({
            ...formData,
            audio: null,
        });
        const audioInput = document.getElementById('audio');
        if (audioInput) {
            audioInput.value = '';
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        // const form = new FormData();
        // form.append('title', formData.title);
        // form.append('description', formData.description);
        // form.append('startDate', formData.startDate);
        // form.append('startTime', currentStartTime);
        // form.append('deadlineDate', formData.deadlineDate);
        // form.append('endTime', currentEndTime);
        // form.append('assignTo', formData.assignTo);
        // form.append('picture', formData.picture);
        // form.append('audio', formData.audio);
        // form.append('assignedBy', formData.assignedBy);

        const requestBody = {
            title: formData.title,
            description: formData.description,
            startDate: formData.startDate,
            startTime: currentStartTime,
            deadlineDate: formData.deadlineDate,
            endTime: currentEndTime,
            assignTo: formData.assignTo,
            // phoneNumber: phoneNumber, // Update this with the appropriate variable
            picture: formData.picture,
            audio: formData.audio,
            assignedBy: formData.assignedBy

        };

        try {
            const response = await axios.post('http://localhost:5000/api/task/createSubemployeeTask', requestBody, {
                headers: {
                    Authorization: localStorage.getItem('authToken'),
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201) {
                console.log('Task created Successfully');
                setSuccessMessage(response.data.message);
                setErrors([]);
                router.push('/receivedTask');
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors([{ msg: 'Internal Server Error' }]);
            }
        }
    };

    return (
        <>
            <NavSideEmp />

            <div className="w-full md:flex justify-center items-center min-h-screen md:mt-10 md:pl-28 bg-slate-50">
                <div className="w-full md:max-w-2xl overflow-x-auto border border-gray-200 rounded-lg p-5 bg-white mt-16">
                    {successMessage && <div className="text-green-500">{successMessage}</div>}
                    <div className=" col-span-2 mb-3 md:text-2xl font-bold text-orange-500 text-left">Create Task</div>

                    <div className="mb-2">
                        <label htmlFor="title" className="block font-semibold text-xs lg:text-sm">
                            Title / कार्यासाठी नाव <span className="text-red-500">*</span>
                        </label>

                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="border-2 border-gray-200 rounded-md px-3 py-2 w-full "
                            required
                        />
                    </div>

                    <div className="mb-2">
                        <label htmlFor="description" className="block font-semibold text-xs lg:text-sm">
                            Description / कार्य वर्णन <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="border-2 border-gray-200 rounded-md px-3 py-2 w-full "
                            required
                        />
                    </div>

                    <div className="mb-2">
                        <label htmlFor="assignTo" className="block font-semibold text-xs lg:text-sm">
                            Assign To / नियुक्त करा <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="assignTo"
                            name="assignTo"
                            value={formData.assignTo}
                            onChange={handleInputChange}
                            className="border-2 border-gray-200 rounded-md px-3 py-1 w-full"
                            required
                        >
                            <option value="" disabled>
                                Select Employee
                            </option>
                            {subemployees.map((subemployee) => (
                                <option key={subemployee.id} value={subemployee.id}>
                                    {subemployee.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
                        <div className="mb-1">
                            <label htmlFor="startDate" className="block font-semibold text-xs lg:text-sm">
                                Start Date / सुरु दिनांक <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className="border-2 border-gray-200 rounded-md px-2 py-1 w-32 md:w-full" // Adjust the width for mobile and larger screens
                                required
                            />
                        </div>


                        <div className="mb-2">
                            <label htmlFor="startTime" className="block font-semibold text-xs lg:text-sm md:pl-7">
                                Start Time / सुरू वेळ <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center md:pl-6">
                                <select
                                    name="startHour"
                                    value={currentStartTime.split(':')[0]}
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
                                    value={currentStartTime.split(':')[1].split(' ')[0]}
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
                                    value={currentStartTime.split(' ')[1]}
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
                            <label htmlFor="deadlineDate" className="block font-semibold text-xs lg:text-sm">
                                Deadline/ अंतिम दिनांक <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="deadlineDate"
                                name="deadlineDate"
                                value={formData.deadlineDate}
                                onChange={handleInputChange}
                                className="border-2 border-gray-200 rounded-md px-2 py-1 w-32 md:w-full" // Adjust the width for mobile and larger screens
                                required
                            />
                        </div>




                        <div className="mb-2">
                            <label htmlFor="endTime" className="block font-semibold md:pl-7 text-xs lg:text-sm ">
                                End Time / अंतिम वेळ <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center md:pl-6">
                                <select
                                    name="endHour"
                                    value={currentEndTime.split(':')[0]}
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
                                    value={currentEndTime.split(':')[1].split(' ')[0]}
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
                                    value={currentEndTime.split(' ')[1]}
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



                        {/* <div className="mb-1">
                        <label htmlFor="picture" className="block font-semibold text-xs lg:text-sm">
                                Picture / फोटो
                            </label>
                            <input
                                type="file"
                                id="picture"
                                name="picture"
                                onChange={handleFileChange}
                                className="border-2 border-gray-200 rounded-md px-2 py-1 w-32 md:w-full text-xs md:text-sm"
                                />
                        </div> */}
                        <div className="mb-1" style={{ position: 'relative' }}>
                            <label htmlFor="picture" className="block font-semibold text-xs lg:text-sm">
                                Picture / फोटो
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    id="picture"
                                    name="picture"
                                    onChange={handleFileChange}
                                    className="border-2 border-gray-200 rounded-md px-2 py-1 w-32 md:w-full text-xs md:text-sm"
                                    style={{ paddingRight: '2.5rem' }} // Adjust padding to accommodate the button
                                />
                                {formData.picture && (
                                    <button
                                        type="button"
                                        onClick={handleRemovePicture}
                                        className="absolute text-black font-bold py-1 px-1 md:px-2 rounded-md text-xs md:text-sm"
                                        style={{ right: '0', top: '0', marginTop: '0.3rem', marginRight: '0.2rem' }}
                                    >
                                        {/* Remove */}
                                        <FontAwesomeIcon icon={faXmark} />

                                    </button>
                                )}
                            </div>
                        </div>

                        {/* <div className="mb-3">
                            <label htmlFor="audio" className="block font-semibold text-xs lg:text-sm">
                                Audio / ऑडिओ
                            </label>
                            <input
                                type="file"
                                id="audio"
                                name="audio"
                                onChange={handleFileChange}
                                className="border-2 border-gray-200 rounded-md px-2 py-1 w-32 md:w-full text-xs md:text-sm"
                            />
                        </div> */}

                        <div className="mb-1 md:pl-6" style={{ position: 'relative' }}>
                            <label htmlFor="audio" className="block font-semibold text-xs lg:text-sm">
                                Audio / ऑडिओ
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    id="audio"
                                    name="audio"
                                    onChange={handleFileChange}
                                    className="border-2 border-gray-200 rounded-md px-2 py-1 w-32 md:w-full text-xs md:text-sm"
                                    style={{ paddingRight: '2.5rem' }} // Adjust padding to accommodate the button
                                />
                                {formData.audio && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveAudio}
                                        className="absolute text-black font-bold py-1 px-2 rounded-md text-xs md:text-sm"
                                        style={{ right: '0', top: '0', marginTop: '0.3rem', marginRight: '0.2rem' }}
                                    >
                                        {/* Remove */}
                                        <FontAwesomeIcon icon={faXmark} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="col-span-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                        >
                            Create Task
                        </button>
                    </form>
                    {errors.length > 0 && (
                        <div className="mt-4">
                            <ul className="text-red-500">
                                {errors.map((error, index) => (
                                    <li key={index}>{error.msg}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TaskFormInternal;