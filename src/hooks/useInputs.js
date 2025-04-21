import { useState, useEffect } from 'react';
import { getInputs } from 'src/services/inputsService';

export const useInputs = () => {
  const [inputs, setInputs] = useState([]);
  const [templateId, setTemplateId] = useState(-1);

  useEffect(() => {
    if(templateId >= 0)
        getInputs(templateId, setInputs);
  }, [templateId]);

  return inputs;
};