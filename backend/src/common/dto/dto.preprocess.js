import { z } from 'zod';

function withBody(schema) {
    console.log('preprocess run');
    
  return z.preprocess(
    (val) => (val === undefined || val === null ? {} : val),
    schema
  );
}

//export default withBody