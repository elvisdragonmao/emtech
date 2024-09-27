import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  vus: 10, // Number of virtual users
  duration: "30s" // Test duration
};

export default function () {
  const response = http.get("https://example.com");
  check(response, {
    "status is 200": (r) => r.status === 200
  });
  sleep(1);
}
