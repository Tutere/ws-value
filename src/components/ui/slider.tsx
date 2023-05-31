import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Label } from "@radix-ui/react-label";
import { InfoIcon } from "./infoIcon";

function valuetext(value: number) {
    return `${value}`;
}

interface InputSectionProps<T extends FieldValues> {
    methods: UseFormReturn<T, any>;
    methodsField: Path<T>;
    defaultValue: string | number;
    label: string;
    infoContent: string;
    renderType: 'effort' | 'outcome' | 'benefits' | 'experience';
}

export default function DiscreteSlider<T extends FieldValues>(
    props: InputSectionProps<T>
) {
    const [value, setValue] = React.useState(0);

    const handleSliderChange = (event: any, newValue: React.SetStateAction<number>) => {
        setValue(newValue);
    };

    function renderSwitch(param: number) {
        switch (props.renderType) {
            case 'effort':
                return renderEffort(param);
            case 'outcome':
                return renderOutcome(param);
            case 'benefits':
                return renderBenefits(param);
            case 'experience':
                return renderExperience(param);
            default:
                return 'foo';
        }
    }

    function renderEffort(param: number) {
        switch (param) {
            case 1:
                return 'No Effort at all';
            case 2:
                return 'Very little effort';
            default:
                return 'foo';
        }
    }

    function renderOutcome(param: number) {
        switch (param) {
            case 1:
                return 'Nothing changed';
            case 2:
                return 'Very little change, not noticeable';
            default:
                return 'foo';
        }
    }

    function renderBenefits(param: number) {
        switch (param) {
            case 1:
                return 'No Benefit at all';
            case 2:
                return 'Very little benefit, not noticeable';
            default:
                return 'foo';
        }
    }

    function renderExperience(param: number) {
        switch (param) {
            case 1:
                return 'No Benefit at all';
            case 2:
                return 'Very little benefit, not noticeable';
            default:
                return 'foo';
        }
    }

    return (
        <div className="grid w-full max-w-md items-center gap-1.5">
            <div className="flex">
                <Label htmlFor={props.methodsField.toString()}>{props.label}</Label>
            </div>
            <div className="flex items-center">
                <Box sx={{ width: 415 }} className="mr-4">
                    <Slider
                        {...props.methods.register(props.methodsField)}

                        onChange={handleSliderChange} //its this error again!! I can't remember how we fixed it last time!!
                        aria-label="Effort Score"
                        getAriaValueText={valuetext}
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={1}
                        max={10}
                    />

                </Box>
                <InfoIcon content={props.infoContent} />
            </div>
            {value} {renderSwitch(value)}

        </div>
    );
}