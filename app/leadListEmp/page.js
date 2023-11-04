'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faEye, faSpinner, faShareNodes, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import NavSideEmp from '../components/NavSideEmp';

const LeadListEmp = () => {
  const [leads, setLeads] = useState([]);
  const [viewLead, setViewLead] = useState(null);
  const [editLead, setEditLead] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);


  const [editedLead, setEditedLead] = useState(null);

  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(`http://localhost:5000/api/lead/editLead/${editedLead._id}`, editedLead, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 200) {
        console.log('Lead edited successfully');
        // Close the edit modal and update the leads data
        setIsEditModalOpen(false);
        setLeads((prevLeads) =>
          prevLeads.map((lead) => (lead._id === editedLead._id ? editedLead : lead))
        );
      } else {
        console.error('Failed to edit lead');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/lead/leadList', {
          headers: {
            Authorization: token,
          },
        });
        setLeads(response.data);
      } catch (error) {
        console.error('Error fetching leads:', error);
      }
    };

    fetchLeads();
  }, []);

  const handleViewClick = (lead) => {
    setViewLead(lead);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (lead) => {
    setEditedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`http://localhost:5000/api/lead/deleteLead/${leadToDelete._id}`, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 200) {
        console.log('Lead deleted successfully');
        // Remove the deleted lead from the leads list
        setLeads((prevLeads) => prevLeads.filter((lead) => lead._id !== leadToDelete._id));
        // Close the delete confirmation modal
        setIsDeleteModalOpen(false);
      } else {
        console.error('Failed to delete lead');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleDeleteLead = (leadId) => {
    // Find the lead to delete and set it in the state
    const lead = leads.find((lead) => lead._id === leadId);
    setLeadToDelete(lead);
    // Open the delete confirmation modal
    setIsDeleteModalOpen(true);
  };


  return (
    <>
      <NavSideEmp />
      <div className="m-5 pl-5 md:pl-72 mt-20">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-indigo-500">Lead List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className='bg-violet-300'>
              <tr>
                <th className="p-3 text-center">Sr.No</th>
                <th className="p-3 text-left">Customer Name</th>
                {/* <th className="border border-gray-200 p-3">Company Name</th> */}
                {/* <th className=" p-3">Description</th> */}
                <th className="p-3 text-left">Contact No</th>
                <th className="p-3 text-center">Email</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, index) => (
                <tr key={lead._id}>
                  <td className="border border-violet-300 p-3 text-center">{index + 1}</td>
                  <td className="border border-violet-300 p-3">{lead.customerName}</td>
                  {/* <td className="border border-gray-200 p-3">{lead.companyName}</td> */}
                  {/* <td className="border border-violet-300 p-3">{lead.description}</td> */}
                  <td className="border border-violet-300 p-3">{lead.contactNo}</td>
                  <td className="border border-violet-300 p-3">{lead.email}</td>
                  <td className="border border-violet-300">
                    <div style={{ display: 'flex' }}>
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        className="text-orange-500 hover:underline cursor-pointer md:pl-5 pl-2"
                        onClick={() => handleEditClick(lead)}
                      />
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="text-red-500 hover:underline cursor-pointer md:pl-5 pl-2"
                        onClick={() => handleDeleteLead(lead._id)}
                      />
                      <FontAwesomeIcon
                        icon={faEye}
                        className="text-blue-500 hover:underline cursor-pointer md:pl-5 md:-mr-16 pl-2  "
                        onClick={() => handleViewClick(lead)}
                      />
                    </div>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isViewModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="modal-container bg-white w-72 md:w-96 p-6 rounded shadow-lg">
              <div className="p-2 text-center text-sm md:text-base">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Lead Details</h3>
                {viewLead && (
                  <div>
                    <p className="mb-2 text-left justify-center">
                      <strong  >Created By:</strong> {viewLead.assignedByName}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong  >Customer Name:</strong> {viewLead.customerName}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong    >Company Name:</strong> {viewLead.companyName}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Contact No:</strong> {viewLead.contactNo}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong  >Email:</strong> {viewLead.email}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Description:</strong> {viewLead.description}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded mt-4"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isEditModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="modal-container bg-white w-72 md:w-96 p-5 rounded shadow-lg mt-2 md:mt-0">
              <div className="text-center">
                <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-400">Edit Lead</h3>
                {editedLead && (
                  <div>
                    <div className="mb-1">
                      <label htmlFor="customerName" className="text-left justify-center block mb-1 text-sm md:text-base">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={editedLead.customerName}
                        onChange={(e) => setEditedLead({ ...editedLead, customerName: e.target.value })}
                        className="border border-gray-200 p-1 w-full rounded text-sm md:text-base"
                      />
                    </div>
                    <div className="mb-1">
                      <label htmlFor="companyName" className="text-left justify-center block mb-1 text-sm md:text-base">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={editedLead.companyName}
                        onChange={(e) => setEditedLead({ ...editedLead, companyName: e.target.value })}
                        className="border border-gray-200 p-1 w-full rounded text-sm md:text-base"
                      />
                    </div>
                    <div className="mb-1">
                      <label htmlFor="contactNo" className="text-left justify-center block mb-1 text-sm md:text-base">
                        Contact No
                      </label>
                      <input
                        type="text"
                        name="contactNo"
                        value={editedLead.contactNo}
                        onChange={(e) => setEditedLead({ ...editedLead, contactNo: e.target.value })}
                        className="border border-gray-200 p-1 w-full rounded text-sm md:text-base"
                      />
                    </div>
                    <div className="mb-1">
                      <label htmlFor="email" className="text-left justify-center block mb-1 text-sm md:text-base">
                        Email
                      </label>
                      <input
                        type="text"
                        name="email"
                        value={editedLead.email}
                        onChange={(e) => setEditedLead({ ...editedLead, email: e.target.value })}
                        className="border border-gray-200 p-1 w-full rounded text-sm md:text-base"
                      />
                    </div>
                    <div className="mb-1">
                      <label htmlFor="description" className="text-left justify-center block mb-1 text-sm md:text-base">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editedLead.description}
                        onChange={(e) => setEditedLead({ ...editedLead, description: e.target.value })}
                        className="border border-gray-200 p-1 w-full rounded text-sm md:text-base"
                      />
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={handleEditSave}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 text-sm md:text-base"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditModalOpen(false)}
                        className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-sm md:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}


        {isDeleteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="modal-container bg-white sm:p-4 sm:w-96 rounded shadow-lg">
              <div className="p-5 text-center">
                <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <p className="mb-3 text-center font-medium">Delete this lead?</p>
                <div className="mt-4">
                  <button
                    onClick={handleConfirmDelete}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 mr-4 rounded text-sm md:text-base"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-sm md:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default LeadListEmp;