import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Dialog } from "@rn-vui/themed";
import moment from "moment";
import { Colors } from "../../utils";
import { font } from "../../../styles";
import Button from "../ButtonComponent/Button";

interface CustomDatePickerProps {
    modal?: boolean;
    open?: boolean;
    date: Date;
    mode?: "date" | "time" | "datetime";
    onConfirm: (date: Date) => void;
    onCancel: () => void;
    title?: string;
    theme?: "light" | "dark";
    confirmText?: string;
    cancelText?: string;
    minimumDate?: Date;
    maximumDate?: Date;
}

const CustomDatePicker = ({
    open,
    date,
    mode = "date",
    onConfirm,
    onCancel,
    title,
    confirmText = "Confirm",
    cancelText = "Cancel",
    minimumDate,
    maximumDate,
}: CustomDatePickerProps) => {
    const [tempDate, setTempDate] = useState(date);

    useEffect(() => {
        if (open) {
            setTempDate(date);
        }
    }, [open, date]);

    if (!open) return null;

    const handleConfirm = () => {
        onConfirm(tempDate);
    };

    const handleDateChange = (e: any) => {
        const newDate = new Date(e.target.value);
        if (!isNaN(newDate.getTime())) {
            // Preserve time when changing date
            if (mode === "date") {
                newDate.setHours(tempDate.getHours());
                newDate.setMinutes(tempDate.getMinutes());
            }
            setTempDate(newDate);
        }
    };

    const handleTimeChange = (e: any) => {
        const [hours, minutes] = e.target.value.split(":");
        const newDate = new Date(tempDate);
        newDate.setHours(parseInt(hours, 10));
        newDate.setMinutes(parseInt(minutes, 10));
        setTempDate(newDate);
    };

    return (
        <Dialog
            isVisible={open}
            onBackdropPress={onCancel}
            overlayStyle={styles.overlay}
        >
            <View style={styles.container}>
                {title && (
                    <Text style={[font.Bold, styles.title]}>
                        {title}
                    </Text>
                )}

                <View style={styles.inputContainer}>
                    {mode === "date" || mode === "datetime" ? (
                        <input
                            type="date"
                            style={styles.htmlInput as any}
                            value={moment(tempDate).format("YYYY-MM-DD")}
                            onChange={handleDateChange}
                            min={minimumDate ? moment(minimumDate).format("YYYY-MM-DD") : undefined}
                            max={maximumDate ? moment(maximumDate).format("YYYY-MM-DD") : undefined}
                        />
                    ) : null}

                    {mode === "time" || mode === "datetime" ? (
                        <input
                            type="time"
                            style={{ ...styles.htmlInput, marginTop: mode === "datetime" ? 10 : 0 } as any}
                            value={moment(tempDate).format("HH:mm")}
                            onChange={handleTimeChange}
                        />
                    ) : null}
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={onCancel} style={styles.button}>
                        <Text style={[font.SemiBold, { color: Colors.secondary }]}>{cancelText}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleConfirm} style={[styles.button, styles.confirmButton]}>
                        <Text style={[font.Bold, { color: "white" }]}>{confirmText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Dialog>
    );
};

const styles = StyleSheet.create({
    overlay: {
        borderRadius: 20,
        width: "90%",
        maxWidth: 400,
        padding: 20,
        backgroundColor: "white",
    },
    container: {
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        marginBottom: 20,
        color: Colors.secondary,
    },
    inputContainer: {
        width: "100%",
        marginBottom: 20,
    },
    htmlInput: {
        width: "100%",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primary,
        fontSize: 16,
        // @ts-ignore - Web specific
        outlineWidth: 0,
        fontFamily: "inherit",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        width: "100%",
        gap: 10,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    confirmButton: {
        backgroundColor: Colors.primary,
    },
});

export default CustomDatePicker;
