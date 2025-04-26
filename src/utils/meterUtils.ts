// Simulated meter reading API - In production, this would connect to actual smart meter APIs
export const getMeterReading = async (meterNo: string): Promise<number> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a random reading between 100-1000 units
  // In production, this would fetch real data from the meter
  const lastReading = getLastReading(meterNo);
  let newReading;
  
  do {
    newReading = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
  } while (newReading <= lastReading); // Ensure new reading is always higher than last reading
  
  return newReading;
};

export const getLastReading = (meterNo: string): number => {
  const readings = JSON.parse(localStorage.getItem(`meter_${meterNo}`) || '[]');
  return readings.length > 0 ? readings[readings.length - 1] : 0;
};

export const storeReading = (meterNo: string, reading: number): void => {
  if (reading < 0) {
    throw new Error('Meter reading cannot be negative');
  }
  
  const lastReading = getLastReading(meterNo);
  if (reading <= lastReading) {
    throw new Error('New reading must be greater than the last reading');
  }
  
  const readings = JSON.parse(localStorage.getItem(`meter_${meterNo}`) || '[]');
  readings.push(reading);
  localStorage.setItem(`meter_${meterNo}`, JSON.stringify(readings));
};