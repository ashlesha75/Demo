'use client'
import React, { useEffect, useState } from "react";
import { Chart } from "chart.js";
import axios from "axios";
import NavSideEmp from "../components/NavSideEmp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faSquareCheck, faHourglassHalf, faExclamationCircle, faUpload, faDownload} from "@fortawesome/free-solid-svg-icons";

const VectorEmp = () => {
  const [chartData, setChartData] = useState([]);
  const labelStyles = [
    { label: "Completed Tasks", color: "rgb(34,139,34)", icon: faSquareCheck,  iconSize: "l" },
    { label: "Pending Tasks", color: "rgb(0,71,171)", icon: faHourglassHalf,  iconSize: "l" },
    { label: "Overdue Tasks", color: "rgb(210,4,45)", icon: faExclamationCircle,  iconSize: "l" },
    { label: "Send Tasks", color: "rgb(255, 215, 0)", icon: faUpload,  iconSize: "l" },
    
    { label: "Received Tasks", color: "rgb(218,165,32)", icon: faDownload,  iconSize: "l" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get("http://localhost:5000/api/task/taskCounts", {
          headers: {
            Authorization: token,
          },
        });

        if (response.data) {
          const taskCounts = response.data;
          const chartData = [
            taskCounts.receivedTasks,
            taskCounts.completedTasks,
            taskCounts.pendingTasks,
            taskCounts.overdueTasks,
            taskCounts.sendTasks,
          ];

          setChartData(chartData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let ctx = document.getElementById("myChart").getContext("2d");
    let myChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: chartData,
            borderColor: ["rgb(34,139,34)", "rgb(0,71,171)", "rgb(210,4,45)", "rgb(218,165,32)", "rgb(255, 215, 0)"],
            backgroundColor: ["rgb(34,139,34)", "rgb(0,71,171)", "rgb(210,4,45)", "rgb(218,165,32)", "rgb(255, 215, 0)"],
            borderWidth: 2,
          },
        ],
        labels: labelStyles.map((item) => item.label),
      },
      options: {
        cutoutPercentage: 50,
        scales: {
          xAxes: [
            {
              display: false,
            },
          ],
          yAxes: [
            {
              display: false,
            },
          ],
        },
        legend: {
          display: false,
          position: "right",
        },
        plugins: {
          labels: {
            render: "label",
            arc: true,
            position: "border",
            fontSize: 28,
            fontStyle: "bold",
            fontColor: "#000",
            fontFamily: "Arial",
          },
        },
      },
    });
  }, [chartData]);

  return (
    <>
      <NavSideEmp />
      <div className="mt-20"></div>
      <div className="w-full h-screen flex flex-col items-center">
        <div className="desktop-box p-4 m-4 bg-white rounded-lg text-center text-2xl font-bold text-red-800">
          <h1>Task Management</h1>
          <div className="w-full flex justify-center items-center mt-5">
            <canvas id="myChart" className={`cursor-pointer ${isMobileView() ? "mobile-graph" : "desktop-graph"}`}></canvas>
          </div>
          <div className="text-center text-sm desktop-labels pt-20 pl-3 text-md md:text-base">
            {labelStyles.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-start mb-2 ${
                  isMobileView() ? "mobile-label-box" : "desktop-label-box"
                }`}
              >
                {isMobileView() && (
                  <div
                    className="label-box-mobile"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px",
                      borderRadius: "4px",
                      boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                      width: "100%",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={item.icon}
                      style={{
                        color: item.color,
                        width: "30px",
                        height: "15px",
                        marginRight: "10px",
                      }}
                    />
                    <p>{item.label}</p>
                  </div>
                )}
                {!isMobileView() && (
                  <>
                    <FontAwesomeIcon
                      icon={item.icon}
                      style={{
                        color: item.color,
                        width: "30px",
                        height: "15px",
                        marginRight: "10px",
                      }}
                    />
                    <p>{item.label}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (min-width: 768px) {
          .desktop-graph {
            width: 100%;
            margin-right: 250px;
          }
          .desktop-box {
            width: 65%;
            position: absolute;
            box-shadow: 0 2px 2px -2px gray, 0 -2px 2px -2px gray, -2px 0 2px -2px gray, 2px 0 2px -2px gray;
            right: 6%;
          }
          .desktop-labels {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: 70px;
          }
          .desktop-label-box {
            display: flex;
            align-items: center;
          }
        }

        @media (max-width: 767px) {
          .mobile-graph {
            width: 50%;
          }
          .desktop-box {
            width: 100%;
            right: auto;
          }
          .desktop-labels {
            text-align: center;
          }
          .mobile-label-box {
            display: flex;
            align-items: center;
          }
          .label-box-mobile {
            margin-right: 10px;
          }
        }
      `}</style>
    </>
  );
};

const isMobileView = () => {
  return window.innerWidth <= 767;
};

export default VectorEmp;

// 'use client'

// import React, { useEffect, useState } from "react";
// import { Chart } from "chart.js";
// import axios from "axios";
// import NavSideEmp from "../components/NavSideEmp";

// const VectorEmp = () => {
//   const [chartData, setChartData] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         const response = await axios.get("http://localhost:5000/api/task/taskCounts", {
//           headers: {
//             Authorization: token,
//           },
//         });

//         if (response.data) {
//           const taskCounts = response.data;
//           const chartData = [taskCounts.receivedTasks, taskCounts.completedTasks, taskCounts.pendingTasks, taskCounts.overdueTasks, taskCounts.sendTasks];

//           setChartData(chartData);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   useEffect(() => {
//     let ctx = document.getElementById("myChart").getContext("2d");
//     let myChart = new Chart(ctx, {
//       type: "doughnut",
//       data: {
//         datasets: [
//           {
//             data: chartData,
//             borderColor: ["rgb(218,165,32)", "rgb(34,139,34)", "rgb(0,71,171)", "rgb(210,4,45)", "rgb(255, 215, 0)"],
//             backgroundColor: ["rgb(218,165,32)", "rgb(34,139,34)", "rgb(0,71,171)", "rgb(210,4,45)", "rgb(255, 215, 0)"],

//             borderWidth: 2,
//           },
//         ],
//         labels: ["Received Tasks", "Completed Tasks", "Pending Tasks", "Overdue Tasks", "Send Tasks"],
//       },
//       options: {
//         cutoutPercentage: 50, // Specify the percentage of the hole in the center of the doughnut chart

//         scales: {
//           xAxes: [
//             {
//               display: false,
//             },
//           ],
//           yAxes: [
//             {
//               display: false,
//             },
//           ],
//         },
//         legend: {
//           display: true,
//           position: "right",
//         },
//         plugins: {
//           labels: {
//             render: "label",
//             arc: true,
//             position: "border",
//             fontSize: 28,
//             fontStyle: "bold",
//             fontColor: "#000",
//             fontFamily: "Arial",
//           },
//         },
//       },
//     });
//   }, [chartData]);

//   return (
//     <>
//       <NavSideEmp />
//       <div className="text-right pl-32 -mt-5">
//         <h1 className="w-[200px] mx-96 text-2xl font-bold capitalize mt-28 text-right text-orange-700">Dashboard</h1>
//       </div>
//       <div className="w-[1100px] h-screen flex mx-auto my-auto pl-36 mt-5">
//         <div className="pt-0 rounded-xl w-full h-fit my-auto pb-2">
//           <canvas id="myChart" className=" cursor-pointer -mt-32"></canvas>
//         </div>
//       </div>
//     </>
//   );
// };

// export default VectorEmp;
