export const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const statusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "applied":
      return "bg-info text-info-foreground";
    case "interviewing":
      return "bg-warning text-warning-foreground";
    case "offer":
      return "bg-success text-success-foreground";
    case "rejected":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};
