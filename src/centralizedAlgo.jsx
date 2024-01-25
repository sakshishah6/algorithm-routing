// Dijikstra's algorithm

export function centralizedAlgo(graph, startNode) {
  
  // Convert startNode to int
  startNode = parseInt(startNode, 10);
  const n = graph.length;

  // Initialize arrays
  const distances = new Array(n).fill(Infinity);
  const visited = new Array(n).fill(false);
  const paths = new Array(n).fill(null);
  
  // Set distance (cost) and path from start node to itself
  distances[startNode] = 0;
  paths[startNode] = [startNode];
  
  // Iterate through all nodes in adj matrix
  for (let i = 0; i < n - 1; i++) {

    // Get node with min cost from starting node
    const u = minDistance(distances, visited);
    visited[u] = true;

    // Iterate through all neighbouring nodes to that node that have not been visited yet
    for (let v = 0; v < n; v++) {

      // Compare total distance from starting node to that node and update with the shortest path & distance
      if (graph[u][v] !== 0 && !visited[v] && distances[u] !== Infinity && distances[u] + graph[u][v] < distances[v]) {
        distances[v] = distances[u] + graph[u][v];
        paths[v] = paths[u].concat(v);
      }
    }
  }

  return {
    distances, 
    paths
  }
}

// Return index of the unvisited node with the smallest distance
function minDistance(distances, visited) {
  let min = Infinity;
  let minIndex = -1;
  
  for (let i = 0; i < distances.length; i++) {
    if (!visited[i] && distances[i] <= min) {
      min = distances[i];
      minIndex = i;
    }
  }
  
  return minIndex;
}
