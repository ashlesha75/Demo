'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import NavSide from '../components/NavSide';
import SubemployeeForm from '../subemp/page';


const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [editedEmployee, setEditedEmployee] = useState(null);
  const [viewEmployeeData, setViewEmployeeData] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  let serialNumber = 1; // Initialize the serial number

  const [searchQuery, setSearchQuery] = useState('');




  const clearSuccessMessage = () => {
    setTimeout(() => {
      setSuccessMessage('');
    }, 2000); // 2000 milliseconds (2 seconds)
  };

  const router = useRouter();

  useEffect(() => {
    // Fetch the list of employees from your API endpoint
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/employee/subemployees/list`,
          {
            headers: {
              Authorization: localStorage.getItem('authToken'),
              // Other headers if needed
            }
          });
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };


  const filteredEmployees = employees.filter((employee) => {
    return (
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.adminCompanyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  const handleEditClick = (employeeId) => {
    // Open the edit modal when the "Edit" button is clicked
    setIsEditModalOpen(true);
    const selectedEmployee = employees.find((employee) => employee._id === employeeId);

    // Set the selected employee for editing
    setEditedEmployee(selectedEmployee);
  };

  const editEmployee = async () => {
    try {
      // Update the editedEmployee object with the new values
      const updatedEmployee = {
        ...editedEmployee,
        phoneNumber: editedEmployee.phoneNumber,
        email: editedEmployee.email,
      };

      // Send a PUT request to update the employee's details
      await axios.put(`http://localhost:5000/api/subemployee/update/${editedEmployee._id}`, updatedEmployee,
        {
          headers: {
            Authorization: localStorage.getItem('authToken'),
            // Other headers if needed
          }
        });

      // Update the employee list with the edited data (optional)
      setEmployees(employees.map((employee) =>
        employee._id === editedEmployee._id ? updatedEmployee : employee
      ));

      // Close the edit modal
      closeModal();

      setSuccessMessage('Employee details updated successfully');
      clearSuccessMessage();

      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error editing employee:', error);

      setError('Failed to update employee details');
      setSuccessMessage(''); // Clear any previous success messages
    }
  };

  const handleDeleteClick = (employeeId) => {
    // Open the delete modal when the "Delete" button is clicked
    setIsDeleteModalOpen(true);
    // Set the selected employee for deletion
    setEmployeeToDelete(employeeId);
  };

  const handleViewClick = async (employeeId) => {
    try {
      // Send a GET request to fetch the employee by ID
      const response = await axios.get(`http://localhost:5000/api/subemployee/${employeeId}`,
        {
          headers: {
            Authorization: localStorage.getItem('authToken'),
            // Other headers if needed
          }
        });
      const employeeData = response.data;

      // Set the employee data to the state
      setViewEmployeeData(employeeData);

      // Open the view modal
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  const confirmDelete = async (employeeId) => {
    try {
      // Send a DELETE request to delete the employee by ID
      await axios.delete(`http://localhost:5000/api/subemployee/delete/${employeeId}`,
        {
          headers: {
            Authorization: localStorage.getItem('authToken'),
            // Other headers if needed
          }
        });

      // Update the employee list after successful deletion (optional)
      setEmployees(employees.filter((employee) => employee._id !== employeeId));

      // Close the delete modal
      closeModal();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const closeModal = () => {
    // Close both edit and delete modals when the close button or backdrop is clicked
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    // Reset the selected employee IDs
    setEmployeeToDelete(null);
  };

  const handleAddClick = () => {
    // Redirect to the "Add Employee" page
    router.push('/subemp');
  };

  return (
    <>

      <NavSide />
      <div className="m-5 pl-1 md:pl-64 mt-20">
        {/* Display error message */}

        {error && <p className="text-red-500">{error}</p>}

        {/* Display success message */}
        {successMessage && (
          <div className="text-green-500">
            {successMessage}
          </div>
        )}
        {/* <h2 className="text-2xl font-semibold mb-4 text-orange-500">Employee List</h2> */}
        <h1 className="text-xl font-bold mb-4 text-orange-500 text-center md:text-left md:text-2xl">Employee List</h1>

        <div className="flex justify-center items-center mb-4">
          <input
            type="text"
            placeholder="Search Employees"
            className="px-3 py-1 border border-gray-400 rounded-full w-full md:w-96"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
        </div>

        <div className="relative mb-10 md:mb-20">
          <button
            className="bg-orange-500 text-white font-bold py-0.5 px-3 rounded-lg absolute top-2 right-1"
            onClick={handleAddClick}
          >
            Add Employee

          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto mt-1">
            <thead className='bg-orange-400 text-white'>
              <tr>
                <th className="px-4 py-2 text-center  text-white">Sr.No.</th>
                <th className="px-4 py-2 text-center text-white">Name</th>
                <th className="px-4 py-2 text-center text-white">Email</th>
                <th className="px-4 py-2 text-center text-white">Phone Number</th>
                <th className="px-4 py-2 text-center text-white">Company Name</th>
                <th className="px-4 py-2 text-center text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <tr key={employee._id}>
                  <td className="border px-4 py-2 text-center">{serialNumber++}</td>
                  <td className="border px-4 py-2 text-left">{employee.name}</td>
                  <td className="border px-4 py-2">{employee.email}</td>
                  <td className="border px-4 py-2">{employee.phoneNumber}</td>
                  <td className="border px-4 py-2">{employee.adminCompanyName}</td>
                  <td className="border px-4 py-2">

                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="text-orange-500 hover:underline mr-5 cursor-pointer pl-5 "
                      onClick={() => handleEditClick(employee._id)}
                    />
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="text-red-500 hover:underline mr-5 cursor-pointer pl-5"
                      onClick={() => handleDeleteClick(employee._id)}
                    />
                    <FontAwesomeIcon
                      icon={faEye}
                      className="text-blue-500 hover:underline mr-5 cursor-pointer pl-5"
                      onClick={() => handleViewClick(employee._id)}
                    />
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-2 text-center border">
                    No Employee added.
                  </td>
                </tr>
              )
              }
            </tbody>
          </table>
        </div>

        {/* Edit Employee Modal */}
        {isEditModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
            <div
              className="modal-container bg-white w-72 md:w-96 p-6 rounded shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={closeModal}
              >
                {/* Close button icon */}
              </button>
              <div className="p-2 text-center">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Edit Employee</h3>
                {/* Modal content */}
                <div className="mb-4">
                  <label className="block text-left text-gray-800 dark:text-gray-200 text-sm md:text-base font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-md p-2 text-sm md:text-base text-left"
                    value={editedEmployee.name || ''}
                    onChange={(e) => setEditedEmployee({ ...editedEmployee, name: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-left text-gray-800 dark:text-gray-200 text-sm md:text-base font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-md p-2 text-sm md:text-base text-left"
                    value={editedEmployee.email || ''}
                    onChange={(e) => setEditedEmployee({ ...editedEmployee, email: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-left text-gray-800 dark:text-gray-200 text-sm md:text-base font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-md p-2 text-sm md:text-base text-left"
                    value={editedEmployee.phoneNumber || ''}
                    onChange={(e) => setEditedEmployee({ ...editedEmployee, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-left text-gray-800 dark:text-gray-200 text-sm md:text-base font-medium mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-md p-2 text-sm md:text-base text-left"
                    value={editedEmployee.adminCompanyName || ''}
                    onChange={(e) => setEditedEmployee({ ...editedEmployee, adminCompanyName: e.target.value })}
                  />
                </div>

                <button
                  type="button"
                  className="px-6 py-2 text-white bg-green-500 hover:bg-green-600 rounded-md mr-4 transition duration-300 ease-in-out text-sm md:text-base"
                  onClick={editEmployee}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-white bg-green-700 hover:bg-green-600 rounded-md mr-4 transition duration-300 ease-in-out text-sm md:text-base"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Employee Modal */}
        {isDeleteModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
            <div
              className="modal-container bg-white w-72 md:w-96 p-6 rounded shadow-lg"
              onClick={closeModal}
            >
              <button
                type="button"
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={closeModal}
              >
                {/* Close button icon */}
              </button>
              <div className="p-6 text-center">
                <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <h3 className="mb-5 font-normal text-gray-800 dark:text-gray-400 text-sm md:text-base"> Delete this Employee?</h3>
                {/* Modal content */}
                <button
                  type="button"
                  className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-4 py-2 text-center mr-2"
                  onClick={() => confirmDelete(employeeToDelete)}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-4 py-2 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 mr-2"
                  onClick={closeModal}
                >
                 Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isViewModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
            <div className="modal-container bg-white w-72 md:w-96 rounded shadow-lg">
              <button
                type="button"
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => setIsViewModalOpen(false)}
              >
                {/* Close button icon */}
              </button>
              <div className="p-6 text-center">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Employee Details</h3>
                {viewEmployeeData && (
                  <div>
                    <p className="mb-2 text-left justify-center">
                      <strong>Name:</strong> {viewEmployeeData.name}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Phone Number:</strong> {viewEmployeeData.phoneNumber}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Email:</strong> {viewEmployeeData.email}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Company Name:</strong> {viewEmployeeData.adminCompanyName}
                    </p>
                    {/* Add more details here */}
                  </div>
                )}
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-800 font-bold rounded-md mt-4 text-xs md:text-base"
                  onClick={() => setIsViewModalOpen(false)}
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

export default EmployeeList;