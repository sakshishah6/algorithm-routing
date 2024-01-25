//Bellman-Ford Algorithm

export function decentralizedAlgo(graph, startNode) {

    // Convert startNode to int
    startNode = parseInt(startNode);
    const n = graph.length;

    // Initialize distances array
    const distances = new Array(n).fill(Infinity)
    distances[startNode] = 0;

    // Initialize paths array
    const paths = new Array(n).fill(null);
    paths[startNode] = [startNode]

    // Iterate through each node in the adj matrix
    for (let i = 0; i < n-1; i++) {
        for (let u = 0; u < n; u++) {
            for (let v = 0; v < n; v++) {
                // Check if there is an edge between u and v
                if (graph[u][v] !== 0) {
                    // Compare the current shortest distance to v to the distance to u plus the weight of the edge between u and v
                    if (distances[u] + graph[u][v] < distances[v]) {
                        distances[v] = distances[u] + graph[u][v];
                        // If the new path is shorter, update the shortest distance to v and the shortest path to v
                        paths[v] = paths[u].concat(v);
                    }
                }
            }
        }
    }

  return {
    distances, 
    paths
  }
}
