// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AvisosProvider, useAvisos } from "./avisos";

function Disparador({ accion = true }: { accion?: boolean }) {
  const { avisar } = useAvisos();
  return (
    <button type="button" onClick={() => avisar("Quitaste un café", accion ? { etiqueta: "Deshacer", alPulsar: () => {} } : undefined)}>
      avisar
    </button>
  );
}

const montar = (accion = true) => {
  render(
    <AvisosProvider>
      <Disparador accion={accion} />
    </AvisosProvider>,
  );
  fireEvent.click(screen.getByText("avisar"));
  return () => document.querySelector<HTMLElement>("[data-aviso]");
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("AvisosProvider (M10, WCAG 2.2.1)", () => {
  it("sin interacción, el aviso con «Deshacer» se va a los 6 s", () => {
    const aviso = montar();
    act(() => vi.advanceTimersByTime(5999));
    expect(aviso()).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(aviso()).toBeNull();
  });

  it("con el cursor encima no se va; al salir sigue con el tiempo que le quedaba", () => {
    const aviso = montar();
    act(() => vi.advanceTimersByTime(4000));
    fireEvent.mouseEnter(aviso()!);
    act(() => vi.advanceTimersByTime(60_000));
    expect(aviso()).not.toBeNull();
    fireEvent.mouseLeave(aviso()!);
    act(() => vi.advanceTimersByTime(1999));
    expect(aviso()).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(aviso()).toBeNull();
  });

  it("con el foco dentro no se va; al sacar el foco sigue", () => {
    const aviso = montar();
    act(() => vi.advanceTimersByTime(1000));
    const deshacer = screen.getByRole("button", { name: "Deshacer" });
    act(() => deshacer.focus());
    act(() => vi.advanceTimersByTime(60_000));
    expect(aviso()).not.toBeNull();
    act(() => deshacer.blur());
    act(() => vi.advanceTimersByTime(4999));
    expect(aviso()).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(aviso()).toBeNull();
  });

  it("con cursor y foco, solo reanuda cuando salen los dos", () => {
    const aviso = montar();
    fireEvent.mouseEnter(aviso()!);
    act(() => screen.getByRole("button", { name: "Deshacer" }).focus());
    fireEvent.mouseLeave(aviso()!);
    act(() => vi.advanceTimersByTime(60_000));
    expect(aviso()).not.toBeNull();
    act(() => screen.getByRole("button", { name: "Deshacer" }).blur());
    act(() => vi.advanceTimersByTime(6000));
    expect(aviso()).toBeNull();
  });

  it("«Deshacer» cierra el aviso y el siguiente aviso corre su tiempo completo", () => {
    const aviso = montar();
    fireEvent.mouseEnter(aviso()!);
    fireEvent.click(screen.getByRole("button", { name: "Deshacer" }));
    expect(aviso()).toBeNull();
    fireEvent.click(screen.getByText("avisar"));
    act(() => vi.advanceTimersByTime(6000));
    expect(aviso()).toBeNull();
  });

  it("el aviso sin acción sigue durando 3,2 s", () => {
    const aviso = montar(false);
    act(() => vi.advanceTimersByTime(3199));
    expect(aviso()).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(aviso()).toBeNull();
  });
});
