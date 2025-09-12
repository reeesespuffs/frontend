import { useFloating } from "solid-floating-ui";
import {
  Accessor,
  Show,
  createEffect,
  createSignal,
  on,
  onCleanup,
  onMount,
} from "solid-js";
import { Portal } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";

import { autoUpdate, offset, shift } from "@floating-ui/dom";
import { Trans } from "@lingui-solid/solid/macro";
import type { Channel } from "revolt.js";

import { NotificationState } from "@revolt/state/stores/NotificationOptions";
import { useState } from "@revolt/state";

import {
  ContextMenu,
  ContextMenuButton,
  ContextMenuDivider,
  ContextMenuItem,
} from "@revolt/app/menus/ContextMenu";
import { useClient, useUser } from "@revolt/client";
import { Avatar, Column, Row, Text, UserStatus, } from "@revolt/ui";

import MdNotifications from "@material-design-icons/svg/outlined/notifications.svg?component-solid";
import MdNotificationsOff from "@material-design-icons/svg/outlined/notifications_off.svg?component-solid";
import MdAlternateEmail from "@material-design-icons/svg/outlined/alternate_email.svg?component-solid"
import MdBlock from "@material-design-icons/svg/outlined/block.svg?component-solid"

interface Props {
  anchor: Accessor<HTMLDivElement | undefined>;
}

/**
 * Notification submenu attached to the ChannelContextMenu
 */
export function NotificationMenu(props: Props) {
  const state = useState();
  const { notifications } = useState();

  const [show, setShow] = createSignal(false);
  const [ref, setRef] = createSignal<HTMLDivElement>();

  const position = useFloating(() => props.anchor(), ref, {
    placement: "right-start",
    whileElementsMounted: autoUpdate,
    middleware: [offset(5), shift()],
  });

  onMount(() => document.addEventListener("mousedown", close));
  onCleanup(() => document.removeEventListener("mousedown", close));

  createEffect(
  on(
    () => props.anchor(),
    (anchor) => {
      if (anchor) {
        const open = () => setShow(true);
        const close = () => setShow(false);

        anchor.addEventListener("mouseenter", open);
        anchor.addEventListener("mouseleave", close);

        createEffect(
          on(ref, (submenu) => {
            if (submenu) {
              submenu.addEventListener("mouseenter", open);
              submenu.addEventListener("mouseleave", close);

              onCleanup(() => {
                submenu.removeEventListener("mouseenter", open);
                submenu.removeEventListener("mouseleave", close);
              });
            }
          }),
        );

        onCleanup(() => {
          anchor.removeEventListener("mouseenter", open);
          anchor.removeEventListener("mouseleave", close);
        });
      }
    },
  ),
);


  return (
    <Portal mount={document.getElementById("floating")!}>
      <Presence>
        <Show when={show()}>
          <Motion
            ref={setRef}
            style={{
              position: position.strategy,
              top: `${position.y ?? 0}px`,
              left: `${position.x ?? 0}px`,
              "z-index": 1000,
            }}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, easing: [0.87, 0, 0.13, 1] }}
          >
            <ContextMenu>
              <ContextMenuButton
                icon={MdNotifications}
              >
                <Trans>All Messages</Trans>
              </ContextMenuButton>
              <ContextMenuButton
                icon={MdAlternateEmail}
              >
                <Trans>Mentions Only</Trans>
              </ContextMenuButton>
              <ContextMenuButton
                icon={MdNotificationsOff}
              >
                <Trans>None</Trans>
              </ContextMenuButton>
              <ContextMenuButton
                icon={MdBlock}
              >
                <Trans>Muted</Trans>
              </ContextMenuButton>
            </ContextMenu>
          </Motion>
        </Show>
      </Presence>
    </Portal>
  );
}
