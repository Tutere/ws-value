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
                return 'No Effort at all';
            case 2:
                return 'Bare minimum effort';
            case 3:
                return 'Little bit effort';
            case 4:
                return 'Just under average effort';
            case 5:
                return 'Average effort';
            case 6:
                return 'Just over average effort';
            case 7:
                return 'Gave it a good solid amount of effort but could have made more if really needed';
            case 8:
                return '';
            case 9:
                return ' ';
            case 10:
                return 'The best effort I have ever put in';

            default:
                return 'No score yet';
        }
    }

    function renderOutcome(param: number) {
        switch (param) {
            case 1:
                return 'Nothing changed, no success';
            case 2:
                return 'Very little change, not noticeable';
            case 3:
                return 'A little bit of a change, not very successful';
            case 4:
                return 'There was a below average success';
            case 5:
                return 'There was good enough outcome for it to be a success';
            case 6:
                return 'There was successful change and a little bit more';
            case 7:
                return 'Good success, satisfactory ';
            case 8:
                return 'Great outcome, better than expected';
            case 9:
                return 'Amazing outcome, made some waves for the stakeholders';
            case 10:
                return 'The outcome was so immense it affected the wider community';
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
                return '';
            case 4:
                return '';
            case 5:
                return 'Average Benefit';
            case 6:
                return '';
            case 7:
                return '';
            case 8:
                return '';
            case 9:
                return 'Hugely Beneficial, exceeded expectations';
            case 10:
                return 'Lives have changed positively because of how beneficial this was';
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
                return '';
            case 5:
                return 'Gained an average amount of experience';
            case 6:
                return '';
            case 7:
                return '';
            case 8:
                return '';
            case 9:
                return 'Huge experiences gained, exceeded expectations';
            case 10:
                return 'Lives have changed positively because of how much experience this gave';
            default:
                return '';
        }
    }

    return (
        <div className="grid w-full max-w-md items-center gap-1.5 py-3">
            <div className="flex">
                <Label htmlFor={props.methodsField.toString()}>{props.label}</Label>
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
            {value}  {renderSwitch(value)}

        </div>
    );
}