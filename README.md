vision
======

Live demo + swagger will eventually be here: http://getclarity.eu/

## API Examples

### Stats

```bash
# Swap space used
curl -XGET http://localhost:3000/stats/swap
# e.g. {"data":0.36926866485013626}
```

```bash
# CPU % in 1, 5 and 15 minute intervals
curl -XGET http://localhost:3000/stats/cpu  
# e.g. {"data":{"1":0.09,"5":0.13,"15":0.13}}
```

```bash
# Percentage disk space used on mount where /home/ubuntu is located
curl -XGET http://localhost:3000/stats/percUsed?path=/home/ubuntu  
# e.g. {"data":0.33999999999999997}
```

```bash
# Percentage disk space free on mount where /home/ubuntu is located
curl -XGET http://localhost:3000/stats/percFree?path=/home/ubuntu 
# e.g. {"data":0.66}
```
