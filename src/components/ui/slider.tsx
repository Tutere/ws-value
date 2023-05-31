import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { InfoIcon } from "./infoIcon";
import { FieldValues, Path, UseFormReturn } from "react-hook-form"
import { Label } from "@radix-ui/react-label";

function valuetext(value: number) {
    return `${value}`;
}

interface SliderProps<T extends FieldValues> {
    infoContent: string;
    methods: UseFormReturn<T, any>;
    label: string;
    methodsField: Path<T>;
    defaultValue: string | number;
    required: boolean;
}

export function DiscreteSlider<T extends FieldValues>(
    props: SliderProps<T>
) {
    return (


        <div className="grid w-full max-w-md items-center gap-1.5">
            <div className="flex">
                <Label htmlFor={props.methodsField.toString()}>{props.label}</Label>
                <p className="text-red-600 ml-auto mr-10"> {props.required ? "* required" : ""}</p>
            </div>
            <div className="flex items-center">

                <Box sx={{ width: 415 }}  className="mr-4">
                    <Slider
                        {...props.methods.register(props.methodsField)}
                        aria-label="Score"
                        valueLabelDisplay="auto"
                        getAriaValueText={valuetext}
                        step={1}
                        marks
                        min={1}
                        max={10}
                    />
                </Box>
                <InfoIcon content={props.infoContent} />
            </div>
            {props.methods.formState.errors[props.methodsField]?.message && (
                <p className="text-red-700">
                    {props.methods.formState.errors[
                        props.methodsField
                    ]?.message?.toString()}
                </p>
            )}
        </div>
    );
}
