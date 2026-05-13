import si from 'systeminformation';
export const getSystemMetrics = async () => {

  const cpu = await si.currentLoad();

  const memory = await si.mem();

  const disk = await si.fsSize();

  const network = await si.networkStats();

  return {
    cpu: {
      usage: cpu.currentLoad.toFixed(1)
    },

    ram: {
      total: memory.total,
     used: memory.active,
      usage: (
        (memory.active / memory.total) * 100
      ).toFixed(1)
    },

    disk: {
      usage: disk[0]?.use.toFixed(1)
    },

    network: {
      rx: network[0]?.rx_sec,
      tx: network[0]?.tx_sec
    }
  };
};