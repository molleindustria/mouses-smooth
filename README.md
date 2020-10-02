# Real Time - Part 2

This example uses the same socket.io structure but incorporates a smoothing function on the client side to make the movements continuous despite the low rate of updates from the server.  

The update intervals from both server and clients are very low (10fps) to illustrate the latency issue.  
You may be able to update the game state at 60fps and obtain a much better responsiveness without any smoothing.

The smoothing function is very easy to implement and may suffice for a chill experience but it actually increases the perceived lag because the coordinates from the server are already **old**. The local cursors are chasing a previous position of the remote cursors.

Part 3 implements a client side predictive logic that addresses this issue.