


const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>$'"]/g, '');
};


export default sanitizeInput;