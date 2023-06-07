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
    defaultValue: number ;
    label: string;
    infoContent: string;
    renderType: 'effort' | 'outcome' | 'benefits' | 'experience';
    required: boolean;
}

export default function DiscreteSlider<T extends FieldValues>(
    props: InputSectionProps<T>
) {
    const [value, setValue] = React.useState(props.defaultValue);

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
                return 'error';
        }
    }

    function renderEffort(param: number) {
        switch (param) {
            case 1:
                return 'No effort at all';
              case 2:
                return 'Minimal effort';
              case 3:
                return 'Some effort';
              case 4:
                return 'Below average effort';
              case 5:
                return 'Average effort';
              case 6:
                return 'Above average effort';
              case 7:
                return 'Good amount of effort, but room for improvement';
              case 8:
                return 'Significant effort';
              case 9:
                return 'Outstanding effort';
              case 10:
                return 'Exceptional effort';

            default:
                return 'No score yet';
        }
    }

    function renderOutcome(param: number) {
        switch (param) {
            case 1:
                return 'Negligible outcome, no change';
              case 2:
                return 'Minimal outcome, barely noticeable change';
              case 3:
                return 'Minor outcome, not very impactful';
              case 4:
                return 'Below-average outcome, limited success';
              case 5:
                return 'Moderate outcome, satisfactory level of success';
              case 6:
                return 'Substantial outcome, notable progress';
              case 7:
                return 'Good outcome, commendable achievement';
              case 8:
                return 'Excellent outcome, exceeding expectations';
              case 9:
                return 'Remarkable outcome, significant impact on stakeholders';
              case 10:
                return 'Transformative outcome, profound effect on the community';
            default:
                return 'No score yet';
        }
    }

    function renderBenefits(param: number) {
        switch (param) {
            case 1:
                return 'No benefit at all';
              case 2:
                return 'Very little benefit, not noticeable';
              case 3:
                return 'Limited benefit, minimal impact';
              case 4:
                return 'Below-average benefit, some positive effect';
              case 5:
                return 'Average benefit, moderate positive impact';
              case 6:
                return 'Decent benefit, noticeable improvement';
              case 7:
                return 'Significant benefit, substantial positive impact';
              case 8:
                return 'Great benefit, surpassing expectations';
              case 9:
                return 'Hugely beneficial, transformative impact';
              case 10:
                return 'Life-changing benefit, profound positive transformation';
            default:
                return '';
        }
    }

    function renderExperience(param: number) {
        switch (param) {
            case 1:
                return 'No experience gained at all';
              case 2:
                return 'Very little experience, not noticeable';
              case 3:
                return 'Some experience gained';
              case 4:
                return 'Limited experience, minor learning';
              case 5:
                return 'Average amount of experience gained';
              case 6:
                return 'Decent experience, noticeable learning';
              case 7:
                return 'Significant experience, substantial learning';
              case 8:
                return 'Great experience, surpassing expectations';
              case 9:
                return 'Huge experiences gained, transformative learning';
              case 10:
                return 'Life-changing experience, profound positive transformation';
            default:
                return '';
        }
    }

    return (
        <div className="grid w-full max-w-md items-center gap-1.5 py-3">
            <div className="flex">
                <Label htmlFor={props.methodsField.toString()}>{props.label}</Label>
                <p className="text-red-600 ml-auto mr-10"> {props.required? "* required" : ""}</p>
            </div>
            <div className="flex items-center">
                <Box sx={{ width: 415 }} className="mr-4">
                    <Slider
                        {...props.methods.register(props.methodsField)}

                        onChange={handleSliderChange} //its this error again!! I can't remember how we fixed it last time!!
                        aria-label="Score"
                        getAriaValueText={valuetext}
                        valueLabelDisplay='auto'
                        step={1}
                        marks
                        min={1}
                        max={10}
                        track={false}
                        defaultValue={props.defaultValue}
                        
                    />

                </Box>
                <InfoIcon content={props.infoContent} />
            </div>
            {value} - {renderSwitch(value)}

        </div>
    );
}