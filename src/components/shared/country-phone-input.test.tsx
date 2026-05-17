import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";

const phoneInput = () => document.getElementById("p") as HTMLInputElement;

const useQuerySpy = vi.fn();

vi.mock("@apollo/client/react", () => ({
  useQuery: () => useQuerySpy(),
}));

import { CountryPhoneInput } from "./country-phone-input";

const COUNTRIES = [
  {
    id: "gh",
    iso2: "GH",
    phoneCode: "233",
    emoji: null,
    phoneStartsWithZero: true,
    phonePlaceholder: "024 123 4567",
  },
  {
    id: "ng",
    iso2: "NG",
    phoneCode: "234",
    emoji: null,
    phoneStartsWithZero: true,
    phonePlaceholder: "0801 234 5678",
  },
];

beforeEach(() => {
  useQuerySpy.mockReturnValue({ data: { countries: COUNTRIES } });
});

describe("<CountryPhoneInput />", () => {
  it("emits E.164 with the default country dial code", () => {
    const onChange = vi.fn();
    render(<CountryPhoneInput value="" onChange={onChange} id="p" />);
    fireEvent.change(phoneInput(), {
      target: { value: "241234567" },
    });
    expect(onChange).toHaveBeenLastCalledWith("+233241234567");
  });

  it("strips a leading zero for countries that write local numbers with one", () => {
    const onChange = vi.fn();
    render(<CountryPhoneInput value="" onChange={onChange} id="p" />);
    fireEvent.change(phoneInput(), {
      target: { value: "0241234567" },
    });
    // Not +2330241234567 (doubled zero) - the leading 0 is dropped.
    expect(onChange).toHaveBeenLastCalledWith("+233241234567");
  });

  it("emits '' when the local part is cleared (so 'no phone' stays empty)", () => {
    const onChange = vi.fn();
    render(
      <CountryPhoneInput value="+233241234567" onChange={onChange} id="p" />
    );
    fireEvent.change(phoneInput(), {
      target: { value: "" },
    });
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("splits a controlled E.164 value back into the local part for display", () => {
    render(
      <CountryPhoneInput value="+233241234567" onChange={vi.fn()} id="p" />
    );
    expect(phoneInput().value).toBe("241234567");
  });

  it("ignores non-digits typed into the number field", () => {
    const onChange = vi.fn();
    render(<CountryPhoneInput value="" onChange={onChange} id="p" />);
    fireEvent.change(phoneInput(), {
      target: { value: "24-123 45 67" },
    });
    expect(onChange).toHaveBeenLastCalledWith("+233241234567");
  });

  it("falls back to Ghana when the countries query returns nothing", () => {
    useQuerySpy.mockReturnValue({ data: { countries: [] } });
    const onChange = vi.fn();
    render(<CountryPhoneInput value="" onChange={onChange} id="p" />);
    fireEvent.change(phoneInput(), {
      target: { value: "241234567" },
    });
    expect(onChange).toHaveBeenLastCalledWith("+233241234567");
  });
});
