import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

function valuetext(value:number) {
  return `${value}`;
}

interface InputSectionProps<T extends FieldValues> {
  methods: UseFormReturn<T, any>;
  methodsField: Path<T>;
}

export default function DiscreteSlider<T extends FieldValues>(
  props: InputSectionProps<T>
) {
  return (
    <Box sx={{ width: 300 }}>
      <Slider
        {...props.methods.register(props.methodsField)}
        aria-label="Temperature"
        defaultValue={3}
        getAriaValueText={valuetext}
        valueLabelDisplay="auto"
        step={1}
        marks
        min={1}
        max={10}
      />
      <Slider defaultValue={30} step={10} marks min={10} max={110} disabled />
    </Box>
  );
}