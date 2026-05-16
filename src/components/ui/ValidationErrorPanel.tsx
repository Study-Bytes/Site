import { Alert, List, ListItem, ListItemText } from "@mui/material";
import type { ApiValidationError } from "../../api/bffContracts";

export function ValidationErrorPanel({ errors }: { errors: ApiValidationError[] }) {
    if (errors.length === 0) return null;

    return (
        <Alert severity="error">
            <List dense disablePadding>
                {errors.map((error, index) => (
                    <ListItem key={`${error.field ?? "validation"}-${index}`} disablePadding>
                        <ListItemText primary={error.field ? `${error.field}: ${error.message}` : error.message} />
                    </ListItem>
                ))}
            </List>
        </Alert>
    );
}
