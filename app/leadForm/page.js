'use client'

import React, { useState } from 'react';
import axios from 'axios';
import NavSide from '../components/NavSide';
import { useRouter } from 'next/navigation';

const LeadForm = () => {
    const router=useRouter()
    const [formData, setFormData] = useState({
        customerName: '',
        companyName: '',
        contactNo: '',
        email: '',
        description: '',
        ownerName: '',
        website: '',
        leadPicture: null,
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, leadPicture: e.target.files[0] });
    };

    const clearForm = () => {
        setFormData({
            customerName: '',
            companyName: '',
            contactNo: '',
            email: '',
            description: '',
            ownerName: '',
            website: '',
            leadPicture: null,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataWithFile = new FormData();
        for (const key in formData) {
            formDataWithFile.append(key, formData[key]);
        }

        const token = localStorage.getItem('authToken');
        const headers = { Authorization: token };

        try {
            const response = await axios.post('http://localhost:5000/api/lead/createLead', formDataWithFile, { headers });
            console.log('Lead created:', response.data);

            // Send the lead notification
            const leadNotificationData = {
                message: 'A new lead has been created',
                description: formData.description,
                customerName: formData.customerName,
                companyName: formData.companyName,
                contactNo: formData.contactNo,
                email: formData.email,
                ownerName: formData.ownerName,
                website: formData.website,
            };

            // Send the lead notification with the file
            const leadNotificationFormData = new FormData();
            for (const key in leadNotificationData) {
                leadNotificationFormData.append(key, leadNotificationData[key]);
            }
            leadNotificationFormData.append('leadPicture', formData.leadPicture);

            const leadNotificationResponse = await axios.post('http://localhost:5000/api/lead/create/Notification', leadNotificationFormData, { headers });
            console.log('Lead notification created:', leadNotificationResponse.data);
            clearForm();
            router.push('/leadList')
        } catch (error) {
            console.error('Error creating lead:', error);
        }
    };

    return (
        <>
           
            <NavSide />
            <div className="w-full md:flex justify-center items-center min-h-screen md:mt-10 md:pl-28 bg-slate-50">
                <div className="w-full md:w-1/2 mt-24 md:mt-0 lg:mt-0">
                    <div className="w-max-w-2xl overflow-x-auto border border-gray-200 rouned-lg p-5 bg-white shadow-md rounded ">
                        <h1 className="text-xl font-bold mb-4 text-orange-500">Create Lead</h1>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <div className="mb-2">
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="customerName">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    id="customerName"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleInputChange}
                                    placeholder='Enter Name'
                                    className="border rounded-md px-2 py-1 text-xs md:text-base w-full"
                                />
                            </div>
                            <div className="mb-2 pl-3">
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="companyName">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    id="companyName"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    placeholder='Company name'
                                    className="border rounded-md px-2 py-1 text-xs md:text-base w-full"
                                />
                            </div>
                            <div className="mb-2">
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="contactNo">
                                    Mobile No
                                </label>
                                <input
                                    type="text"
                                    id="contactNo"
                                    name="contactNo"
                                    value={formData.contactNo}
                                    onChange={handleInputChange}
                                    placeholder='+123-456-7890'
                                    className="border rounded-md px-2 py-1 text-xs md:text-base w-full"
                                    />
                            </div>
                            <div className="mb-2 pl-3">
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    type="text"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder='****@gmail.com'
                                    className="border rounded-md px-2 py-1 text-xs md:text-base w-full"
                                     />
                            </div>
                            <div className="mb-2">
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="description">
                                    Lead Description
                                </label>
                                <input
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="border rounded-md px-2 py-1 text-xs md:text-base w-full"
                                    />
                            </div>
                            <div className="mb-2 pl-3">
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="ownerName">
                                    Owner&apos;s Name
                                </label>
                                <input
                                    type="text"
                                    id="ownerName"
                                    name="ownerName"
                                    value={formData.ownerName}
                                    onChange={handleInputChange}
                                    className="border rounded-md px-2 py-1 text-xs md:text-base w-full"
                                     />
                            </div>
                            <div className="mb-2">
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="website">
                                    Website
                                </label>
                                <input
                                    type="text"
                                    id="website"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    placeholder='www.example.com'
                                    className="border rounded-md px-2 py-1 text-xs md:text-base w-full"
                                     />
                            </div>
                            <div className="mb-4 pl-3">
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="leadPicture">
                                    Lead Picture
                                </label>
                                <input
                                    type="file"
                                    id="leadPicture"
                                    name="leadPicture"
                                    onChange={handleChange}
                                    className="border rounded-md px-2 py-1 text-xs md:text-base w-full"
                                />
                            </div>

                            <div className="col-span-2 flex justify-center">
                                <button
                                    type="submit"
                                    className="text-sm md:text-base  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Create Lead
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LeadForm;
