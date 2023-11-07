'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/AdminSidebar';
import { useRouter } from 'next/navigation';
import NavSide from '../components/NavSide';
import {faEye,faEyeSlash,faEnvelope} from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const SubemployeeForm = () => {
    const router = useRouter()
    const [phoneNumberError, setPhoneNumberError] = useState(null);

    const [subEmployee, setSubEmployee] = useState({
        name: '',
        email: '',
        password: '',
        adminCompanyName: '', // Pre-fill with the admin company name
        phoneNumber: '',
    });
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
      };

      const handlePasswordChange = (e) => {
        setPassword(e.target.value);
      };

    useEffect(() => {
        // Fetch the admin's company name and pre-fill it in the form
        const fetchAdminCompany = async () => {
            try {
                const token = localStorage.getItem('authToken'); // Retrieve JWT token from localStorage
                const response = await axios.get('http://localhost:5000/api/employee/subemployees/company', {
                    headers: {
                        Authorization: token, // Include JWT token in the request headers
                    },
                });
                setSubEmployee((prev) => ({
                    ...prev,
                    adminCompanyName: response.data.companyName,
                }));
            } catch (error) {
                console.error('Error fetching admin company:', error);
                setError('Error fetching admin company');
            }
        };

        fetchAdminCompany();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Phone number validation using regex
        const phoneNumberPattern = /^\d{10}$/; // Matches a 10-digit number
        if (name === 'phoneNumber' && !phoneNumberPattern.test(value)) {
            setPhoneNumberError('Phone number should be 10 digits');
        } else {
            setPhoneNumberError(null);
        }
        setSubEmployee((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("clicked")

        // Send a POST request to create the subemployee
        try {
            const token = localStorage.getItem('authToken'); // Retrieve JWT token from localStorage
            await axios.post('http://localhost:5000/api/employee/registersub', subEmployee, {
                headers: {
                    Authorization: token, // Include JWT token in the request headers
                },
            });
            setSuccessMessage('Employee registered successfully');
            setError(null);

            // Clear the form fields
            setSubEmployee({
                name: '',
                email: '',
                password: '',
                adminCompanyName: subEmployee.adminCompanyName,
                phoneNumber: '',
            });

            router.push('/subList');

        } catch (error) {
            console.error('Error registering subemployee:', error);
            setError('Error registering subemployee');
        }
    };

    return (
        <>
            <NavSide/>
            <div>
                <section className="bg-gray-50 dark:bg-gray-900 ">
                    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-6 ">
                        <div className="w-72 md:w-96 p-4 mt-10 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
                            <h2 className="text-xl font-bold leading-tight tracking-tight text-orange-500 md:text-2xl dark:text-white">
                                Create Employee
                            </h2>
                            <form onSubmit={handleSubmit} className="mt-2 space-y-2 lg:mt-3 md:space-y-3">
                                <div>
                                    <label htmlFor="name" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 text-sm md:text-base"
                                        placeholder="Enter Employee Name"
                                        required
                                        value={subEmployee.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="relative">
                                    <label htmlFor="email" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">Email <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 text-sm md:text-base"
                                        placeholder="Enter Email Address"
                                        required
                                        value={subEmployee.email}
                                        onChange={handleChange}
                                    />
                                    <span className="absolute right-3 top-2 transform -translate-y-0">
                                    <FontAwesomeIcon
                                     icon={faEnvelope}
                                     className="text-gray-500 mt-6"
                                     />{" "}
                                     {/* Email icon */}
                                    </span>
                                </div>
                                <div className="relative">
                                    <label htmlFor="password" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">Password <span className="text-red-500">*</span></label>
                                    <input
                                     type={showPassword ? "text" : "password"}
                                     name="password"
                                     id="password"
                                     placeholder="Enter Password"
                                     required
                                     value={subEmployee.password}
                                     onChange={handleChange}
                                     className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 text-sm md:text-base"
                                     />
                                    {/* <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        id="password"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 text-sm md:text-base"
                                        placeholder="Enter Password"
                                        required
                                        value={subEmployee.password}
                                        onChange={handleChange}
                                    /> */}
                                    <span
                                     className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                     onClick={togglePasswordVisibility}
                                    >
                                    <FontAwesomeIcon
                                    icon={showPassword ? faEye : faEyeSlash} // Use the imported icons
                                    className="text-gray-500 mt-6"
                                    />
                                   </span>
                                </div>
                                {/* <div>
                                    <label htmlFor="adminCompanyName" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">Admin Company</label>
                                    <input
                                        type="text"
                                        name="adminCompanyName"
                                        id="adminCompanyName"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 font-bold sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 text-sm md:text-base"
                                        readOnly
                                        value={subEmployee.adminCompanyName}
                                    />
                                </div> */}
                                <div>
                                    <label htmlFor="phoneNumber" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">Phone Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        id="phoneNumber"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 text-sm md:text-base"
                                        placeholder="+91 123-456-789"
                                        required
                                        value={subEmployee.phoneNumber}
                                        onChange={handleChange}
                                    />
                                    {phoneNumberError && <p className="text-red-500 text-sm mt-1">{phoneNumberError}</p>}

                                </div>
                                <button
                                    type="submit"
                                    className="col-span-2 bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg w-full text-sm md:text-base"                            >
                                    Create Employee
                                </button>
                            </form>
                            {successMessage && <p className="mt-4 text-green-600">{successMessage}</p>}
                            {error && <p className="mt-4 text-red-600">{error}</p>}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default SubemployeeForm;

