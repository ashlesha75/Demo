'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import NavSide from '../components/NavSide';


const Overdue = () => {
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTask, setViewTask] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [completeImageUrl, setPreviewImageUrl] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };


  const handlePicturePreview = (imageUrl) => {
    const completeImageUrl = `http://localhost:5000/${imageUrl}`; // Generate the complete image URL
    setPreviewImageUrl(completeImageUrl);
    setIsPreviewModalOpen(true);
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  // Fetch overdue tasks when the component mounts
  useEffect(() => {
    const fetchOverdueTasks = async () => {
      try {
        const authToken = localStorage.getItem('authToken');

        const response = await axios.get('http://localhost:5000/api/task/tasks/overdue', {
          headers: {
            Authorization: authToken,
          },
        });

        console.log(response.data)
        if (response.data && response.data.overdueTasks) {
          // Map assignTo and assignedBy IDs to names
          const tasksWithNames = await Promise.all(
            response.data.overdueTasks.map(async (task) => {
              const assignToNameResponse = await axios.get(`http://localhost:5000/api/subemployee/${task.assignTo}`, {
                headers: {
                  Authorization: authToken, // Include Authorization header for employee request
                },
              });
              const assignedByNameResponse = await axios.get(`http://localhost:5000/api/employee/${task.assignedBy}`, {
                headers: {
                  Authorization: authToken, // Include Authorization header for employee request
                },
              });
              const assignToName = assignToNameResponse.data.name;
              const assignedByName = assignedByNameResponse.data.name;
              return {
                ...task,
                assignTo: assignToName,
                assignedBy: assignedByName,
              };
            })
          );
          setOverdueTasks(tasksWithNames);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching overdue tasks:', error);
        setLoading(false);
      }
    };

    fetchOverdueTasks();
  }, []);

  useEffect(() => {
    const filtered = overdueTasks.filter((task) => {
      console.log(overdueTasks)
      const assigneeName = task.assignTo.toLowerCase();
      const startDate = task.startDate.toLowerCase();
      const deadlineDate = formatDate(task.deadlineDate);
      const status = task.status.toLowerCase();
      const title = task.title.toLowerCase();
      const query = searchQuery.toLowerCase();

      return (
        assigneeName.includes(query) ||
        deadlineDate.includes(query) ||
        title.includes(query) ||
        status.includes(query) ||
        startDate.includes(query)
      );
    });

    setFilteredTasks(filtered);
  }, [searchQuery, overdueTasks]);


  // Function to handle viewing a task
  const handleViewTask = (task) => {
    setViewTask(task); // Set the task to be viewed
  };

  // Function to close the view modal
  const handleCloseViewModal = () => {
    setViewTask(null); // Clear the task to close the modal
  };

  return (
    <>

      <NavSide />
      <div className="m-5 pl-1 md:pl-64 mt-20">
        <h1 className="text-xl font-bold mb-4 text-orange-500 md:text-2xl">Overdue Tasks</h1>

        <div className="flex justify-center items-center mb-4">
          <input
            type="text"
            placeholder="Search Tasks"
            className="px-3 py-1 border border-gray-400 rounded-full w-full md:w-96"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
        </div>


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
            <table className="min-w-full border-collapse table-auto">
              <thead className="bg-orange-400 text-white">
                <tr>
                  <th className="px-4 py-2">Sr. No.</th>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Assign To</th>
                  {/* <th className="px-4 py-2">Assigned By</th> */}
                  <th className="px-4 py-2">Started Date</th>
                  <th className="px-4 py-2">DeadLine Date</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {overdueTasks.length > 0 ? (
                  filteredTasks.map((task, index) => (
                    <tr key={task._id}>
                      <td className="px-4 py-2 text-center border">{index + 1}</td>
                      <td className="px-4 py-2 text-center border">{task.title}</td>
                      <td className="px-4 py-2 text-center border"><span className='px-2 py-1 bg-red-200 text-red-800 rounded-full text-sm'>Overdue</span> </td>
                      <td className="px-4 py-2 text-center border">{task.assignTo}</td>
                      {/* <td className="px-4 py-2 text-center border">{task.assignedBy}</td> */}
                      <td className="px-4 py-2 text-center border">
                        {new Date(task.startDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-2 text-center border">
                        {new Date(task.deadlineDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="border px-12 py-2 text-center">
                        <FontAwesomeIcon
                          icon={faEye}
                          className="text-blue-500 hover:underline cursor-pointer text-lg"
                          onClick={() => handleViewTask(task)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-2 text-center border">
                      No overdue tasks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Task Modal */}
      {viewTask && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-gray-700">
          <div className="modal-container bg-white w-72 md:w-96 sm:p-6 text-xs md:text-base rounded-md">
            <div className='p-2 text-center'>
              <h2 className="text-xl text-center font-semibold mb-4">Task Details</h2>
              <div>
                <p className="mb-2 text-left justify-center">
                  <strong>AssignedBy:</strong> {viewTask.assignedBy}
                </p>
                <p className="mb-2 text-left justify-center">
                  <strong>AssignTo:</strong> {viewTask.assignTo}
                </p>
                <p className="mb-2 text-left justify-center">
                  <strong>Title:</strong> {viewTask.title}
                </p>
                <p className="mb-2 text-left justify-center">
                  <strong>Description:</strong> {viewTask.description}
                </p>
                <p className="mb-2 text-left justify-center">
                  <strong>Status:</strong> Overdue
                </p>
                <p className="mb-2 text-left justify-center">
                  <strong>Date:</strong> {new Date(viewTask.startDate).toLocaleDateString('en-GB')}
                </p>
                <p className="mb-2 text-left justify-center">
                  <strong>Start Time:</strong> {viewTask.startTime}
                </p>
                <p className="mb-2 text-left justify-center">
                  <strong>DeadLine:</strong> {new Date(viewTask.deadlineDate).toLocaleDateString('en-GB')}
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

                <p className="mb-2 text-left flex item-center">
                  <span className='mr-1 '><strong>Audio:</strong></span>{" "}
                  {viewTask.audio ? (
                    <audio controls className='w-64 h-8 md:w-96 md-h-10 text-lg'>
                      <source src={`http://localhost:5000/${viewTask.audio}`} type="audio/mp3" />
                      Your browser does not support the audio element.
                    </audio>

                  ) : (
                    "Not Added"
                  )}
                </p>
                <p className='text-center'>
                  <button
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    onClick={handleCloseViewModal}
                  >
                    Close
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPreviewModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-container bg-white w-96 p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setIsPreviewModalOpen(false)}></button>
            <div className="p-1 text-center">
              <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Image Preview</h3>
              <Image
                src={completeImageUrl}
                alt="Preview"
                width={400} // Adjust the width as needed
                height={300} // Adjust the height as needed
              />
              <button
                type="button"
                className="bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded mt-4 mr-2"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Overdue;



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Navbar from '../components/Navbar';
// import Sidebar from '../components/Sidebar';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEye } from '@fortawesome/free-solid-svg-icons';

// const Overdue = () => {
//   const [overdueTasks, setOverdueTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [selectedTask, setSelectedTask] = useState(null);

//   useEffect(() => {
//     const fetchOverdueTasks = async () => {
//       try {
//         const authToken = localStorage.getItem('authToken');

//         const response = await axios.get('http://localhost:5000/api/task/tasks/overdue', {
//           headers: {
//             Authorization: authToken,
//           },
//         });

//         if (response.data && response.data.overdueTasks) {
//           const tasksWithNames = await Promise.all(
//             response.data.overdueTasks.map(async (task) => {
//               const assignToNameResponse = await axios.get(`http://localhost:5000/api/subemployee/${task.assignTo}`, {
//                 headers: {
//                   Authorization: authToken,
//                 },
//               });
//               const assignToName = assignToNameResponse.data.name;
//               return {
//                 ...task,
//                 assignTo: assignToName,
//               };
//             })
//           );

//           setOverdueTasks(tasksWithNames);
//         }
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching overdue tasks:', error);
//         setLoading(false);
//       }
//     };

//     fetchOverdueTasks();
//   }, []);

//   const handleViewClick = (taskId) => {
//     const task = overdueTasks.find((t) => t._id === taskId);
//     setSelectedTask(task);
//     setViewModalOpen(true);
//   };

//   const closeViewModal = () => {
//     setViewModalOpen(false);
//   };

//   return (
//     <>
//       <Navbar />
//       <Sidebar />
//       <div className="container mx-auto m-10 pl-64 mt-20">
//         <h1 className="text-2xl font-bold mb-4">Overdue Tasks</h1>
//         {loading ? (
//           <p>Loading...</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full border-collapse table-auto">
//               <thead>
//                 <tr>
//                   <th className="px-4 py-2">Sr. No.</th>
//                   <th className="px-4 py-2">Title</th>
//                   <th className="px-4 py-2">Status</th>
//                   <th className="px-4 py-2">AssignTo</th>
//                   <th className="px-4 py-2">Started Date</th>
//                   <th className="px-4 py-2">Deadline Date</th>
//                   <th className="px-4 py-2 text-left">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {overdueTasks.length > 0 ? (
//                   overdueTasks.map((task, index) => (
//                     <tr key={task._id}>
//                       <td className="px-4 py-2 text-center border">{index + 1}</td>
//                       <td className="px-4 py-2 text-center border">{task.title}</td>
//                       <td className="px-4 py-2 text-center border">Overdue</td>
//                       <td className="px-4 py-2 text-center border">{task.assignTo}</td>
//                       <td className="px-4 py-2 text-center border">
//                         {new Date(task.startDate).toLocaleDateString('en-GB')}
//                       </td>
//                       <td className="px-4 py-2 text-center border">
//                         {new Date(task.deadlineDate).toLocaleDateString('en-GB')}
//                       </td>
//                       <td className="border px-12 py-2 text-left">
//                         <FontAwesomeIcon
//                           icon={faEye}
//                           className="text-blue-500 hover:underline cursor-pointer"
//                           onClick={() => handleViewClick(task._id)}
//                         />
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="3" className="px-4 py-2 text-center border">
//                       No overdue tasks found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* View Task Modal */}
//       {viewModalOpen && selectedTask && (
//         <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-gray-700">
//           <div className="bg-white p-4 w-1/2 rounded-md">
//             <h2 className="text-2xl font-semibold mb-4">View Task</h2>
//             <div>
//               <p className="mb-2 text-left justify-center">
//                 <strong>AssignedBy:</strong> {selectedTask.assignedBy}
//               </p>
//               <p className="mb-2 text-left justify-center">
//                 <strong>AssignTo:</strong> {selectedTask.assignTo}
//               </p>
//               <p className="mb-2 text-left justify-center">
//                 <strong>Title:</strong> {selectedTask.title}
//               </p>
//               <p className="mb-2 text-left justify-center">
//                 <strong>Description:</strong> {selectedTask.description}
//               </p>
//               <p className="mb-2 text-left justify-center">
//                 <strong>Status:</strong> {selectedTask.status}
//               </p>
//               <p className="mb-2 text-left justify-center">
//                 <strong>Date:</strong> {selectedTask.startDate}
//               </p>
//               <p className="mb-2 text-left justify-center">
//                 <strong>Start Time:</strong> {selectedTask.startTime}
//               </p>
//               <p className="mb-2 text-left justify-center">
//                 <strong>DeadLine:</strong> {selectedTask.deadlineDate}
//               </p>
//               <p className="mb-2 text-left justify-center">
//                 <strong>End Time:</strong> {selectedTask.endTime}
//               </p>
//               <p className="mb-2 text-left justify-center">
//                 <strong>Photo:</strong> {selectedTask.picture}
//               </p>
//               <p className="mb-2 text-left justify-center">
//                 <strong>Audio:</strong> {selectedTask.audio}
//               </p>

//               <p className='text-center'>
//                 <button
//                   className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
//                   onClick={closeViewModal}
//                 >
//                   Close
//                 </button>
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Overdue;


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Navbar from '../components/Navbar';
// import Sidebar from '../components/Sidebar';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEye } from '@fortawesome/free-solid-svg-icons';


// const Overdue = () => {
//   const [overdueTasks, setOverdueTasks] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch overdue tasks when the component mounts
//   useEffect(() => {
//     const fetchOverdueTasks = async () => {
//       try {
//         const authToken = localStorage.getItem('authToken');

//         const response = await axios.get('http://localhost:5000/api/task/tasks/overdue', {
//           headers: {
//             Authorization: authToken,
//           },
//         });

//         if (response.data && response.data.overdueTasks) {
//           // Map assignTo IDs to names
//           const tasksWithNames = await Promise.all(
//             response.data.overdueTasks.map(async (task) => {
//               const assignToNameResponse = await axios.get(`http://localhost:5000/api/subemployee/${task.assignTo}`, {
//                 headers: {
//                   Authorization: authToken, // Include Authorization header for employee request
//                 },
//               });
//               const assignToName = assignToNameResponse.data.name;
//               return {
//                 ...task,
//                 assignTo: assignToName,
//               };
//             })
//           );
//           console.log(tasksWithNames)
//           setOverdueTasks(tasksWithNames);
//         }
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching overdue tasks:', error);
//         setLoading(false);
//       }
//     };

//     fetchOverdueTasks();
//   }, []);

//   return (
//     <>
//       <Navbar />
//       <Sidebar />
//       <div className="container mx-auto m-10 pl-64 mt-20">
//         <h1 className="text-2xl font-bold mb-4">Overdue Tasks</h1>
//         {loading ? (
//           <p>Loading...</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full border-collapse table-auto">
//               <thead>
//                 <tr>
//                   <th className="px-4 py-2">Sr. No.</th>
//                   <th className="px-4 py-2">Title</th>
//                   <th className="px-4 py-2">Status</th>
//                   <th className="px-4 py-2">AssignTo</th>
//                   {/* <th className="px-4 py-2">Description</th> */}
//                   <th className="px-4 py-2">Started Date</th>
//                   <th className="px-4 py-2">Deadline Date</th>
//                   <th className="px-4 py-2 text-left">Actions</th>
//                   {/* Add more table headers as needed */}
//                 </tr>
//               </thead>
//               <tbody>
//                 {overdueTasks.length > 0 ? (
//                   overdueTasks.map((task, index) => (
//                     <tr key={task._id}>
//                       <td className="px-4 py-2 text-center border">{index + 1}</td>
//                       <td className="px-4 py-2 text-center border">{task.title}</td>
//                       <td className="px-4 py-2 text-center border">Overdue</td>
//                       <td className="px-4 py-2 text-center border">{task.assignTo}</td>
//                       {/* <td className="px-4 py-2 border">{task.description}</td> */}
//                       <td className="px-4 py-2 text-center border">
//                         {new Date(task.startDate).toLocaleDateString('en-GB')}
//                       </td>
//                       <td className="px-4 py-2 text-center border">
//                         {new Date(task.deadlineDate).toLocaleDateString('en-GB')}
//                       </td>
//                       <td className="border px-12 py-2 text-left">

//                         <FontAwesomeIcon
//                           icon={faEye}
//                           className="text-blue-500 hover:underline cursor-pointer"
//                           onClick={() => handleViewClick(task._id)}
//                         />
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="3" className="px-4 py-2 text-center border">
//                       No overdue tasks found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default Overdue;