import { useState, useRef } from 'react';
import { GraphCanvas } from "reagraph";
import Select from 'react-select'
import './App.css'
import routerSvg from './assets/router.svg'
import { centralizedAlgo } from './centralizedAlgo';
import { decentralizedAlgo } from './decentralizedAlgo';
import { saveAs } from 'file-saver';

// Visual theme for application
const theme = {
  "canvas": {
    "background": "#fff",
    "fog": "#fff"
  },
  "node": {
    "fill": "#7CA0AB",
    "activeFill" : "#ca482e",
    "opacity": 1,
    "selectedOpacity": 1,
    "inactiveOpacity": 0.2,
    "label": {
      "color": "black",
      "activeColor" : "#ca482e"
    }
  },
  "lasso": {
    "border": "1px solid #55aaff",
    "background": "rgba(75, 160, 255, 0.1)"
  },
  "ring": {
    "fill": "#D8E6EA",
    "activeFill": "#1DE9AC"
  },
  "edge": {
    "fill": "#D8E6EA",
    "activeFill": "#1DE9AC",
    "opacity": 1,
    "selectedOpacity": 1,
    "inactiveOpacity": 0.1,
    "label": {
      "stroke": "#fff",
      "color": "#2A6475",
      "activeColor" : "#ca482e"
    }
  }
}

// Initalize the default nodes and edges
let initialEdges = [
  {
    id: "1->2",
    source: "1",
    target: "2",
    label: "3"
  },
  {
    id: "2->1",
    source: "2",
    target: "1",
    label: "3"
  },
  {
    id: "1->3",
    source: "1",
    target: "3",
    label: "2"
  },
  {
    id: "3->1",
    source: "3",
    target: "1",
    label: "2"
  },
  {
    id: "2->4",
    source: "2",
    target: "4",
    label: "5"
  },
  {
    id: "4->2",
    source: "4",
    target: "2",
    label: "5"
  },
  {
    id: "3->2",
    source: "3",
    target: "2",
    label: "1"
  },
  {
    id: "2->3",
    source: "2",
    target: "3",
    label: "1"
  },
  {
    id: "3->4",
    source: "3",
    target: "4",
    label: "2"
  },
  {
    id: "4->3",
    source: "4",
    target: "3",
    label: "2"
  },
  {
    id: "2->0",
    source: "2",
    target: "0",
    label: "5"
  },
  {
    id: "0->2",
    source: "0",
    target: "2",
    label: "5"
  },
  {
    id: "3->0",
    source: "3",
    target: "0",
    label: "7",
  },
  {
    id: "0->3",
    source: "0",
    target: "3",
    label: "7"
  }
]

let initialNodes = [
  {
    id: "0",
    label: "Router 0",
    fill: "#264653",
    icon: routerSvg
  },
  {
    id: "1",
    label: "Router 1",
    fill: "#264653",
    icon: routerSvg
  },
  {
    id: "2",
    label: "Router 2",
    fill: "#264653",
    icon: routerSvg
  },
  {
    id: "3",
    label: "Router 3",
    fill: "#264653",
    icon: routerSvg
  },
  {
    id: "4",
    label: "Router 4",
    fill: "#264653",
    icon: routerSvg
  }
]


// Initialize a 15x15 adjacency matrix for nodes & edges
const blankMatrix = [];
const size = 15;

for (let i = 0; i < size; i++) {
  blankMatrix[i] = [];
  for (let j = 0; j < size; j++) {
    blankMatrix[i][j] = 0;
  }
}

// Return the smallest missing number from the nodes array
function getSmallestMissingRouterNum(nodes) {
  let smallestMissingRouterNum = 0;
  nodes.sort((a, b) => a - b);
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i] === smallestMissingRouterNum) {
      smallestMissingRouterNum++;
    }
  }
  return smallestMissingRouterNum;
}

// Get a random number
function getRandomNumber() {
  return Math.floor(Math.random() * 20) + 1;
}

// Remove node from dropdown options
function removeOption(options, target) {
  return options.filter((node) => node.value !== target)
}

// Delete an individual node
function deleteNode(nodes, target) {
  return nodes.filter((node) => node.id !== target);
}

// Remove an individual edge based on source and target nodes
function removeEdgeByNodes(edges, source, target) {
  return edges.filter((edge) => {
    return !(edge.source === source && edge.target === target) && !(edge.source == target && edge.target == source);
  })
}

// Remove all associated edges from a node
function removeEdgesByNode(edges, target) {
  const newEdges = edges.filter((edge) => {
    return edge.source !== target && edge.target !== target;
  });
  return newEdges
}


// Adj Matrix Functions

// Initialize adj matrix with values
function updateAdjMatrixFromGraph(edges, matrix) {

  let updatedMatrix = matrix
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const source = parseInt(edge.source);
    const target = parseInt(edge.target);
    const cost = parseInt(edge.label);
    matrix[source][edge.target] = cost;
  }
  return updatedMatrix;
}

// Update edge relationship in adj matrix
function updateEdgeWeightInMatrix(matrix, row, col, cost) {
  let updatedMatrix = matrix;
  updatedMatrix[row][col] = cost;
  updatedMatrix[col][row] = cost;
  return updatedMatrix;
}

// Use to remove all zero edges relationship when deleting a node
function removeAllEdgesFromNode(nodeString, matrix) {
  let node = parseInt(nodeString)
  let updatedMatrix = matrix;
  for (let i = 0; i < size; i++) {
    updatedMatrix[node][i] = 0;
    updatedMatrix[i][node] = 0;
  }
  return updatedMatrix;
}

function getNodeIds(nodes) {
  let orderedNodeIds = nodes.map(node => ({ value: node.id, label: node.id })).sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
  return orderedNodeIds;
}


function App() {

  const ref = useRef(null)

  //State Initialization

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const initialMatrix = updateAdjMatrixFromGraph(edges, blankMatrix);

  const [selectedNode1Str, setSelectedNode1Str] = useState("");
  const [selectedNode2Str, setSelectedNode2Str] = useState("");

  const [adjMatrix, setAdjMatrix] = useState(initialMatrix);

  const weightOptions = [];

  // Gets possible values for the cost of an edge
  for (let i = 1; i <= 20; i++) {
    const weightOption = {
      value: i.toString(),
      label: i.toString()
    }
    weightOptions.push(weightOption)
  }

  const [edgeWeight, setEdgeWeight] = useState("")

  const [nodeSelection1, setNodeSelection1] = useState("");
  const [nodeSelection2, setNodeSelection2] = useState("");

  // Source router node options
  const [nodeDropDownOptions1, setNodeDropDownOptions1] = useState([
    { value: "0", label: "0" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" }
  ]);

  // Destination router node options
  const [nodeDropDownOptions2, setNodeDropDownOptions2] = useState([
    { value: "0", label: "0" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" }
  ]);

  // Algorithm options
  const [algorithmSelection, setAlgorithmSelection] = useState('');
  const algorithmOptions = [
    { value: 'Centralized', label: 'Centralized Routing' },
    { value: 'Decentralized', label: 'Decentralized Routing' }
  ];


  const [algorithm, setAlgorithm] = useState("");
  const [sourceRouter, setSourceRouter] = useState("");
  const [destRouter, setDestRouter] = useState("");

  const [paths, setPaths] = useState([]);
  const [distances, setDistances] = useState([]);
  const [active, setActive] = useState([]);
  const [showTable, setShowTable] = useState(false);

  const [path, setPath] = useState([]);
  const [distance, setDistance] = useState("");
  const [showResult, setShowResult] = useState(false);

  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [disabled, setDisabled] = useState(false);

  // Handle what happens when Route button is clicked
  const handleRouteButton = () => {
    if (algorithmSelection.value == null || nodeSelection1.value == null) {
      alert("Algorithm or router is not selected.");
    }
    else {
      // Get values of source, destination and algorithm
      setAlgorithm(algorithmSelection.value);
      setSourceRouter(nodeSelection1.value);
      setDestRouter(nodeSelection2.value);

      let shortestPaths = {};

      // Run appropriate algorithm
      if (algorithmSelection.value == "Centralized") {
        shortestPaths = centralizedAlgo(adjMatrix, nodeSelection1.value);
      } else if (algorithmSelection.value == "Decentralized") {
        shortestPaths = decentralizedAlgo(adjMatrix, nodeSelection1.value);
      }

      // Show table result when dest node is not selected
      if (nodeSelection2.value == undefined) {

        // Filter arrays to exclude unintialized nodes
        const filteredDistances = shortestPaths.distances.filter(value => value !== Infinity);
        const filteredPaths = shortestPaths.paths.filter(value => value !== null);

        setPaths(filteredPaths);
        setDistances(filteredDistances);

        let pathsArr = filteredPaths
        let active = []

        // Set active state to highlight path on the graph
        filteredPaths.forEach((pathArr) => {
          pathArr.map((item, index) => {
            if (index < pathArr.length - 1) {
              active.push(...[pathArr[index + 1] + '->' + pathArr[index], pathArr[index] + '->' + pathArr[index + 1]])
            }
          })
        })

        // Update states
        setShowTable(true);
        setShowResult(false);
        setShowErrorMessage(false);
        setActive(active);

      // Show single result when dest node is selected
      } else {

        setDestRouter(nodeSelection2.value);
        
        // Get path and check if it's a valid path
        let pathArr = shortestPaths.paths[parseInt(nodeSelection2.value, 10)];
        
        if (pathArr == undefined) {
          setShowErrorMessage(true);
          setShowResult(false);
        
        } else {
          
          //  Manipulate the type and format of path
          let pathStr = pathArr.join(" \u2192 ");

          setPath(pathStr);
          setDistance(shortestPaths.distances[parseInt(nodeSelection2.value, 10)]);

          // Set active state to highlight path on the graph
          let active = []
          pathArr.map((item, index) => {
            if (index < pathArr.length - 1) {
              active.push(...[pathArr[index + 1] + '->' + pathArr[index], pathArr[index] + '->' + pathArr[index + 1]]);
            }
            active.push(item.toString());
          })

          // Update states
          setActive(active);
          setShowResult(true);
          setShowErrorMessage(false);
        }
        setShowTable(false);
      }

      // Update states
      setDisabled(false);
      setAlgorithmSelection("");
      setNodeSelection1("");
      setNodeSelection2("");
    }
  }

  // Downloads router layout as a JSON file
  function downloadDataAsJSON() {
    const data = {
      edges: edges,
      nodes: nodes,
      matrix: adjMatrix
    }
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json ' });
    saveAs(blob, 'RoutingAlgorithm.json')
  }

  // Imports previously saved router layout JSON file
  function importFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    // Update graph visualization
    reader.onload = (e) => {
      const fileData = JSON.parse(e.target.result);
      const edgesList = fileData.edges;
      setEdges(edgesList);
      const nodesList = fileData.nodes;
      const updatedNodesList = nodesList.map(node => {
        return { ...node, icon: routerSvg }
      })

      //Update states
      setNodes(updatedNodesList);
      const matrix = fileData.matrix;
      setAdjMatrix(matrix);
      const updatedDropDownOptions = getNodeIds(nodesList);
      setNodeDropDownOptions1(updatedDropDownOptions);
      setNodeDropDownOptions2(updatedDropDownOptions);
      setActive([]);
      setShowResult(false);
      setShowErrorMessage(false);
      setShowTable(false);
      setPaths([]);
      setDistances([]);
      setDisabled(false);
    };
    reader.readAsText(file)
  }

  function handleImportFile() {
    document.getElementById('file-import').click()
  }

  // Rearrange layout of nodes and edges
  function rearrangeLayout(nodes) {
    let firstNode = nodes[0]
    let firstNodeId = firstNode.id
    let followingNodes = deleteNode(nodes, firstNodeId);
    setNodes([...followingNodes, firstNode]);
  }

  return (
    <div className="App">

      <div className="title">
        <h2>CPS 706 Final Project</h2>
        <h4>Group 16</h4>
      </div>

      {/* Import, Save, and Reset Buttons */}
      <div className="data-controls">
        <button className="reset-btn" onClick={() => window.location.reload()}>Reset</button>
        <button className="import-btn" onClick={handleImportFile}>Import</button>
        <input type='file' onChange={importFile} id='file-import' className="import-btn" placeholder='Import Data' />
        <button className="save-btn" onClick={() => {
          downloadDataAsJSON()
        }}>Save</button>
      </div>


      {/* Algorithm & Router Selector */}
      <div className="algorithm-selector">
        <div className="algorithm-select-container">
          <h3>Algorithm: </h3>
          <Select className="algorithm-select" value={algorithmSelection} options={algorithmOptions} onChange={setAlgorithmSelection} placeholder="Select Routing Algorithm" />
        </div>
        <div className="source-select-container">
          <h3>Source: </h3>
          <Select className="algorithm-select" value={nodeSelection1} options={nodeDropDownOptions1} onChange={setNodeSelection1} placeholder="Select Source Router" />
        </div>
        <div className="dest-select-container">
          <h3>Destination: </h3>
          <Select className="algorithm-select" value={nodeSelection2} options={nodeDropDownOptions2} isClearable={true} onChange={setNodeSelection2} placeholder="All Routers" />
        </div>
        <button onClick={handleRouteButton}>Route</button>
      </div>

      <div className="user-edits">

        {/* Edge Edits */}
        <div className="edge-edits">
          <Select className="select" options={nodeDropDownOptions1} placeholder="From Router" menuPlacement="top" isSearchable={false} isClearable={true} isDisabled={disabled} onChange={(node) => setSelectedNode1Str(node?.value || "")} />
          <Select className="select" options={nodeDropDownOptions1} placeholder="To Router" menuPlacement="top" isSearchable={false} isClearable={true} isDisabled={disabled} onChange={(node) => setSelectedNode2Str(node?.value || "")} />
          <Select className="select" options={weightOptions} placeholder="Cost" menuPlacement="top" isSearchable={false} isClearable={true} isDisabled={disabled} onChange={(node) => setEdgeWeight(node?.value || "")} />

          <button disabled={disabled} onClick={() => {
            //error checking
            if (selectedNode1Str === selectedNode2Str || selectedNode2Str === "" || selectedNode1Str === "") {
              alert(`You cannot create a link between Router ${selectedNode1Str} and Router ${selectedNode2Str}.`)
            }
            else {
              let weight = 1;
              if (edgeWeight === "") {
                weight = getRandomNumber().toString();
              } else {
                weight = edgeWeight.toString();
              }
              //Remove the edges about to be replaced
              const newEdges = removeEdgeByNodes(edges, selectedNode1Str, selectedNode2Str)
              //Add new edges and update edges state
              setEdges([...newEdges, { id: `${selectedNode1Str}->${selectedNode2Str}`, source: selectedNode1Str, target: selectedNode2Str, label: weight }, { id: `${selectedNode2Str}->${selectedNode1Str}`, source: selectedNode2Str, target: selectedNode1Str, label: weight }])
              const updatedMatrix = updateEdgeWeightInMatrix(adjMatrix, selectedNode1Str, selectedNode2Str, parseInt(weight))
              setAdjMatrix(updatedMatrix);
              //reset edge highlights and table data 
              setActive([]);
              setShowResult(false);
              setShowErrorMessage(false);
              setShowTable(false);
            }
          }}>Update Edge</button>

          <button disabled={disabled} onClick={() => {
            //source and target cannot be the same
            if (selectedNode1Str === selectedNode2Str) {
              alert(`No link exists between Router ${selectedNode1Str} and Router ${selectedNode2Str}.`)
            } else {
              //Remove the edges about to be replaced
              const newEdges = removeEdgeByNodes(edges, selectedNode1Str, selectedNode2Str)
              //Add new edges and update edges state
              setEdges(newEdges)
              const updatedMatrix = updateEdgeWeightInMatrix(adjMatrix, selectedNode1Str, selectedNode2Str, 0);
              setAdjMatrix(updatedMatrix);
              //reset edge highlights and table data 
              setActive([]);
              setShowResult(false);
              setShowErrorMessage(false);
              setShowTable(false);
            }
          }}>Remove Edge</button>

        </div>

        {/* Node Edits */}
        <div className="node-edits">
          <Select className="select" options={nodeDropDownOptions1} placeholder="Router" menuPlacement="top" isSearchable={false} isClearable={true} isDisabled={disabled} onChange={(node) => setNodeSelection1(node?.value || "")} />
          {/* Add a node to selected node */}
          {nodes.length < 15 &&
            <button disabled={disabled} onClick={() => {
              const currentNodes = nodes.map((node) => parseInt(node.id));
              const newNodeId = getSmallestMissingRouterNum(currentNodes);
              //Create new node
              let newNode = {
                id: newNodeId.toString(),
                label: `Router ${newNodeId.toString()}`,
                fill: "#264653",
                icon: routerSvg
              }
              //append node to nodesList
              setNodes([...nodes, newNode])
              //add node to nodes list
              let updatedNodes = [...nodeDropDownOptions1, { value: newNode.id, label: newNode.id }]
              let orderedNodes = updatedNodes.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
              console.log(orderedNodes)
              setNodeDropDownOptions1(orderedNodes);
              setNodeDropDownOptions2(orderedNodes);
              //create edges from new node to selected node
              if (nodeSelection1 !== "") {
                let weight = 1;
                if (edgeWeight === "") {
                  weight = getRandomNumber();
                } else {
                  weight = edgeWeight;
                }
                //handle deleted router selected as input
                if (nodeSelection1 !== newNode.id) {
                  setEdges([...edges, { id: `${nodeSelection1}->${newNode.id}`, source: nodeSelection1, target: newNode.id, label: weight.toString() }, { id: `${newNode.id}->${nodeSelection1}`, source: newNode.id, target: nodeSelection1, label: weight.toString() }]);
                }
              }
              //reset edge highlights and table data 
              setActive([]);
              setShowResult(false);
              setShowErrorMessage(false);
              setShowTable(false);
            }}>Add Router</button>
          }

          {/* Remove selected node */}
          {nodes.length > 1 &&
            <button disabled={disabled} onClick={() => {
              //Remove from nodeDropDownOptions1
              const newOptions = removeOption(nodeDropDownOptions1, nodeSelection1);
              setNodeDropDownOptions1(newOptions);
              setNodeDropDownOptions2(newOptions);
              //remove all associated edges to selected node
              const updatedEdges = removeEdgesByNode(edges, nodeSelection1);
              setEdges(updatedEdges);
              //remove node
              const updatedNodes = deleteNode(nodes, nodeSelection1);
              setNodes(updatedNodes);
              removeAllEdgesFromNode(nodeSelection1, adjMatrix);
              //reset edge highlights and table data 
              setActive([]);
              setShowResult(false);
              setShowErrorMessage(false);
              setShowTable(false);
            }}>Remove Router</button>
          }
        </div>

        {nodes.length > 1 &&
          <button className="debug-btn" onClick={() => {
            console.log("Nodes:")
            console.log(nodes)
            console.log("Edges:")
            console.log(edges)
            console.log("Adj Matrix:")
            console.log(adjMatrix)
            rearrangeLayout(nodes);
          }}>Rearrange Layout</button>
        }


      </div>

      <div className="zoom-controls">
        <button onClick={() => ref.current?.centerGraph()}>Centre</button>
      </div>

      {/* Results of routing */}
      <div className="path-table-container">

        {/* Show error message if no valid path exists */}
        {showErrorMessage && (
          <div className="error-msg">
            <p>There is no valid path from source router <strong>{sourceRouter}</strong> to destination router <strong>{destRouter}</strong>.</p>
          </div>
        )}

        {/* Show single result when destination node is selected */}
        {showResult && (
          <div className="path">
            <p><strong>Algorithm: </strong>{algorithm}</p>
            <p><strong>Source Router: </strong>{sourceRouter}</p>
            <p><strong>Destination Router: </strong>{destRouter}</p>
            <p><strong>Total Cost: </strong>{distance}</p>
            <p><strong>Shortest Path: </strong>{path}</p>
          </div>
        )}

        {/* Show table when destination node is not selected */}
        {showTable && (
          <table>
            <caption><strong>Algorithm: </strong>{algorithm}</caption>
            <caption><strong>Source Router: </strong>{sourceRouter}</caption>
            <thead>
              <tr>
                <th>Destination Router</th>
                <th>Total Cost</th>
                <th>Shortest Path</th>
              </tr>
            </thead>
            <tbody>
              {distances.map((distance, node) => (
                <tr key={node}>
                  <td>{paths[node][paths[node].length - 1]}</td>
                  <td>{distance}</td>
                  <td>{paths[node].join(' \u2192 ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <GraphCanvas
        layoutType="forceDirected2d"
        edgeArrowPosition='none'
        edgeLabelPosition="natural"
        labelType="all"
        ref={ref}
        nodes={nodes}
        edges={edges}
        draggable={false}
        actives={active}
        theme={theme}
      />
    </div>
  )
}

export default App
