import { Label } from "@radix-ui/react-label";
import { Button } from "./Button";
import { Input } from "./Input";
import { InfoIcon } from "./infoIcon";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

interface InputSectionProps<T extends FieldValues> {
  infoContent: string;
  methods: UseFormReturn<T, any>;
  label: string;
  methodsField: Path<T>;
  placeHolder: string;
  type: string;
  defaultValue: string | number;
  required: boolean;
}

export function InputSection<T extends FieldValues>(
  props: InputSectionProps<T>
) {
  return (
    <div className="grid w-full max-w-md items-center gap-1.5">
      <div className="flex">
        <Label htmlFor={props.methodsField.toString()}>{props.label}</Label>
      </div>
      <div className="flex items-center">
        <Input
          {...props.methods.register(props.methodsField)}
          className={props.required === true?  "mr-4 placeholder-red-600" : "mr-4 placeholder:text-slate-400"}
          placeholder={props.required === true? "* Required" : props.placeHolder}
          type={props.type}
          defaultValue={props.defaultValue}
        />
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
