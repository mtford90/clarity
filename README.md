clarity
======

Clarity is a server and stock monitoring tool. Through use of SSH pooling it provides agentless monitoring of:

* System statistics
  * CPU, memory
* Logs
* Stack
  * Redis
  * Elasticsearch
  * Postgres

Clarity has both a javascript client for visualisation as well as a RESTful API and client library exposed via swagger for nodejs.

Live demo + swaggerui will eventually be here: http://getclarity.eu/

Also planned is integration with supervisor (python process control tool) over xml-rpc interface.

## API Examples

### Add servers

TODO

### One-Shot Stats

Get up to date server info:

```bash
# Swap space used
curl -XGET http://localhost:3000/server/:id/stats/swap
# e.g. {"data":0.36926866485013626}
```

```bash
# CPU % in 1, 5 and 15 minute intervals
curl -XGET http://localhost:3000/server/:id/stats/cpu  
# e.g. {"data":{"1":0.09,"5":0.13,"15":0.13}}
```

```bash
# Percentage disk space used on mount where /home/ubuntu is located
curl -XGET http://localhost:3000/server/:id/stats/percUsed?path=/home/ubuntu  
# e.g. {"data":0.33999999999999997}
```

```bash
# Percentage disk space free on mount where /home/ubuntu is located
curl -XGET http://localhost:3000/server/:id/stats/percFree?path=/home/ubuntu 
# e.g. {"data":0.66}
```

### Historical Stats

Clarity makes use of nedb to store historical stats for use in analysis. These are visualised within the javascript client but are also exposed via API:

TODO
